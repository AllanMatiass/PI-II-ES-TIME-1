// autores: Emilly Morelatto e Mateus Campos

// Importa os modelos de dados usados para representar as tabelas do banco

import {
  ClassStudentsDataModel,
  GradeDataModel,
  GradeComponentDataModel,
  StudentDataModel,
  SubjectDataModel,
  GradeComponentValueDataModel,
  SubjectFinalFormulaDataModel,
} from "dataModels";

// Importa cliente do banco, classe de erro da aplicação e os tipos usados nas requisições

import { DatabaseClient } from "../db/DBClient";
import { AppError } from "../errors/AppError";

import {
  ScoreRequestDTO,
  GradeComponentRequestDTO,
  CreateGradeRequestDTO,
} from "dtos";

const db = new DatabaseClient();

// Tabelas usadas no banco

const gradesTable = db.table<GradeDataModel>("grades");
const componentsTable = db.table<GradeComponentDataModel>("grade_components");
const componentValuesTable = db.table<GradeComponentValueDataModel>(
  "grade_component_values"
);
const formulaTable = db.table<SubjectFinalFormulaDataModel>(
  "subject_final_formula"
);

const studentsTable = db.table<StudentDataModel>("students");
const classStudentsTable = db.table<ClassStudentsDataModel>("class_students");
const subjectTable = db.table<SubjectDataModel>("subjects");

// 1. ATUALIZAR NOTAS

export async function updateScoreService(
  subjectId: string,
  score: ScoreRequestDTO,
  professorId: string
) {
  // Extrai dados enviados
  const { student_id, component_id, grade_value } = score;

  // Verifica se o aluno existe
  const student = await studentsTable.findUnique({ id: student_id });
  if (!student) throw new AppError(404, "Student not found.");

  // Verifica se o componente existe
  const comp = await componentsTable.findUnique({ id: component_id });
  if (!comp) throw new AppError(404, "Component not found.");

  // Garante que o componente realmente pertence à disciplina
  if (comp.subject_id !== subjectId)
    throw new AppError(400, "Componente não pertence à disciplina.");

  // Ajusta o valor da nota para ficar entre 0 e 10
  const parsed = Math.min(Math.max(Number(grade_value) || 0, 0), 10);

  // Procura se já existe uma nota cadastrada para este aluno nesse componente
  const existing = await componentValuesTable.findUnique({
    student_id,
    component_id,
  });

  // Guarda valor antigo (para auditoria)
  const oldValue = existing?.grade_value ?? null;

  // Atualiza ou insere a nota
  if (existing) {
    await componentValuesTable.update(
      { grade_value: parsed },
      { id: existing.id }
    );
  } else {
    await componentValuesTable.insert({
      component_id,
      student_id,
      grade_value: parsed,
    });
  }

  // AUDITORIA (nota alterada)
  await db.query("CALL audit_event(?, ?, ?, ?, ?, ?, ?)", [
    professorId,
    "UPDATE_SCORE",
    student_id,
    subjectId,
    component_id,
    oldValue,
    parsed,
  ]);

  // Recalcular final
  await db.query("CALL recalc_student_final_grade(?, ?)", [
    student_id,
    subjectId,
  ]);

  // Busca nota final
  let grade = await gradesTable.findUnique({
    student_id,
    subject_id: subjectId,
  });

  // Caso ainda não exista, cria uma nova e recalcula
  if (!grade) {
    await gradesTable.insert({
      student_id,
      subject_id: subjectId,
      final_grade: 0,
      entry_date: new Date(),
    });

    await db.query("CALL recalc_student_final_grade(?, ?)", [
      student_id,
      subjectId,
    ]);

    grade = await gradesTable.findUnique({
      student_id,
      subject_id: subjectId,
    });
  }

  return grade;
}

// 2. LISTAR NOTAS
export async function listScoreService(classId: string, subjectId: string) {
  // Busca alunos da turma
  const classStudents = await classStudentsTable.findMany({
    class_id: classId,
  });

  // Busca todos os componentes da disciplina
  const components = await componentsTable.findMany({ subject_id: subjectId });

  const result = [];

  // Para cada aluno da turma
  for (const cs of classStudents) {
    const student = await studentsTable.findUnique({ id: cs.student_id });
    if (!student) continue;

    // Busca todas as notas dele
    const studentValues = await componentValuesTable.findMany({
      student_id: student.id,
    });

    // Monta lista de componentes com suas notas
    const detailed = components.map((comp) => {
      const val = studentValues.find((v) => v.component_id === comp.id);
      return {
        component_id: comp.id,
        component_name: comp.name,
        formula_acronym: comp.formula_acronym,
        grade_value: Number(val?.grade_value ?? 0),
      };
    });

    // Busca nota final do aluno
    const grade = await gradesTable.findUnique({
      student_id: student.id,
      subject_id: subjectId,
    });

    // Adiciona no resultado final
    result.push({
      student_id: student.id,
      student_name: student.name,
      registration_id: student.registration_id,
      components: detailed,
      final_grade: Number(grade?.final_grade ?? 0),
    });
  }

  return result;
}

// 3. ADICIONAR UM NOVO COMPONENTE DE NOTA (ex: Prova, Trabalho)

export async function addComponentService(
  data: GradeComponentRequestDTO,
  professorId: string
) {
  const { subject_id, name, formula_acronym, description } = data;

  // Verifica se disciplina existe
  const subject = await subjectTable.findUnique({ id: subject_id });
  if (!subject) throw new AppError(404, "Subject not found.");

  // Impede acrônimo duplicado
  const exists = await componentsTable.findUnique({
    formula_acronym,
    subject_id,
  });

  if (exists) throw new AppError(409, "Acrônimo já existe nesta disciplina.");

  // Cria componente
  const id = await componentsTable.insert({
    name,
    subject_id,
    formula_acronym,
    description,
  });

  // AUDITORIA
  await db.query("CALL audit_event(?, ?, ?, ?, ?, ?, ?)", [
    professorId,
    "ADD_COMPONENT",
    null,
    subject_id,
    id,
    null,
    null,
  ]);

  return {
    message: "Componente criado.",
    component_id: id,
  };
}

// 4. CRIAR GRADE (nota final) PARA ALUNO

export async function addGradeService(data: CreateGradeRequestDTO) {
  const { student_id, subject_id } = data;

  // Valida aluno e disciplina
  const student = await studentsTable.findUnique({ id: student_id });
  if (!student) throw new AppError(404, "Student not found.");

  const subject = await subjectTable.findUnique({ id: subject_id });
  if (!subject) throw new AppError(404, "Subject not found.");

  // Impede duplicidade
  const exists = await gradesTable.findUnique({ student_id, subject_id });
  if (exists)
    throw new AppError(409, "Grade já existe para este aluno na disciplina.");

  // Cria registro de nota final
  const id = await gradesTable.insert({
    student_id,
    subject_id,
    final_grade: 0,
    entry_date: new Date(),
  });

  return {
    message: "Grade criada.",
    grade_id: id,
  };
}

// 5. DEFINIR / ATUALIZAR FÓRMULA DA DISCIPLINA

export async function updateFinalFormulaService(
  subjectId: string,
  formula: string,
  professorId: string
) {
  // Evita divisão literal por zero
  if (/\/\s*0(?!\d)/.test(formula)) {
    throw new AppError(400, "A fórmula contém divisão literal por zero.");
  }

  // Guarda fórmula antiga caso dê erro
  const currentFormula = await formulaTable.findUnique({
    subject_id: subjectId,
  });
  try {
    const subject = await subjectTable.findUnique({ id: subjectId });
    if (!subject) throw new AppError(404, "Subject not found.");

    const existing = await formulaTable.findUnique({ subject_id: subjectId });

    // Se já existe, atualiza
    if (existing) {
      await formulaTable.update({ formula_text: formula }, { id: existing.id });

      // AUDITORIA DA FÓRMULA
      await db.query("CALL audit_event(?, ?, ?, ?, ?, ?, ?)", [
        professorId,
        "UPDATE_FORMULA",
        null,
        subjectId,
        null,
        currentFormula?.formula_text ?? null,
        formula,
      ]);

      // Recalcula nota final de todos os alunos da disciplina
      const grades = await gradesTable.findMany({ subject_id: subjectId });

      for (const grade of grades) {
        await db.query("CALL recalc_student_final_grade(?, ?)", [
          grade.student_id,
          subjectId,
        ]);
      }

      return { message: "Fórmula atualizada." };
    }

    // Caso não exista fórmula ainda, cria uma nova
    await formulaTable.insert({
      subject_id: subjectId,
      formula_text: formula,
    });

    // AUDITORIA DA CRIAÇÃO
    await db.query("CALL audit_event(?, ?, ?, ?, ?, ?, ?)", [
      professorId,
      "CREATE_FORMULA",
      null,
      subjectId,
      null,
      null,
      formula,
    ]);

    return { message: "Fórmula criada." };
  } catch (err: any) {
    // Captura erros lançados pelo banco
    if (err?.code === "ER_SIGNAL_EXCEPTION" || err?.errno === 1644) {
      const clean = err.sqlMessage.replace("Erro: ", "");
      throw new AppError(400, clean);
    }

    // Se algo der errado, restaura fórmula antiga
    console.error("Database error:", err);
    await formulaTable.update(
      { formula_text: currentFormula?.formula_text ?? "" },
      { subject_id: subjectId }
    );

    throw new AppError(500, "Erro ao salvar fórmula.");
  }
}

// 6. BUSCAR FÓRMULA DA DISCIPLINA

export async function getFinalFormulaService(subjectId: string) {
  const subject = await subjectTable.findUnique({ id: subjectId });
  if (!subject) throw new AppError(404, "Subject not found.");

  const formula = await formulaTable.findUnique({ subject_id: subjectId });

  if (!formula) return { formula_text: null };

  return { formula_text: formula.formula_text };
}

// 7. BUSCAR UMA GRADE (nota final) por ID

export async function getGradeById(id: string) {
  const grade = await gradesTable.findUnique({ id });
  if (!grade) throw new AppError(404, "Grade not found.");
  return grade;
}

// 8. BUSCAR COMPONENTES DE UMA DISCIPLINA

export async function getComponentsBySubjectService(subjectId: string) {
  return await componentsTable.findMany({
    subject_id: subjectId,
  });
}

// 9. UPDATE COMPONENTE

export async function updateComponentService(
  componentId: string,
  data: Partial<GradeComponentRequestDTO>,
  professorId: string
) {
  // Busca valores antigos para registrar auditoria
  const before = await componentsTable.findUnique({ id: componentId });

  // Atualiza componente
  await componentsTable.update(data, { id: componentId });

  // AUDITORIA
  await db.query("CALL audit_event(?, ?, ?, ?, ?, ?, ?)", [
    professorId,
    "UPDATE_COMPONENT",
    null,
    before?.subject_id ?? null,
    componentId,
    before?.formula_acronym ?? null,
    data.formula_acronym ?? before?.formula_acronym ?? null,
  ]);
}

// 10. DELETE COMPONENTE

export async function deleteComponentService(
  componentId: string,
  professorId: string
) {
  // Verifica se componente existe
  const component = await componentsTable.findUnique({ id: componentId });

  if (!component) throw new AppError(404, "Component not found!");

  // Pega fórmula da disciplina
  const formula = await formulaTable.findUnique({
    subject_id: component.subject_id,
  });

  // Auditoria
  await db.query("CALL audit_event(?, ?, ?, ?, ?, ?, ?)", [
    professorId,
    "DELETE_COMPONENT",
    null,
    component.subject_id,
    componentId,
    component.formula_acronym,
    null,
  ]);

  // Remove componente
  await componentsTable.deleteMany({ id: componentId });

  // Remove componente da fórmula, se existir
  if (formula) {
    const newFormula =
      removeComponentFromFormulaSafe(
        formula.formula_text,
        component.formula_acronym
      ) ?? "";

    // Atualiza fórmula com componente removido
    await formulaTable.update(
      { formula_text: newFormula },
      {
        id: formula.id,
      }
    );

    await db.query("CALL recalc_all_final_grades(?)", [component.subject_id]);
  }
}

// Função auxiliar para remover componente da fórmula de forma segura

function removeComponentFromFormulaSafe(formula: string, comp: string) {
  let f = formula;

  // Troca o acrônimo removido por 0
  f = f.replaceAll(comp, "0");

  // Limpa " + 0" ou " - 0"
  f = f.replace(/(\+|\-)\s*0(?=[\)\+\-\/\*])?/g, "");

  // Remove 0 antes de + ou -
  f = f.replace(/0\s*(\+|\-)/g, "$1");

  // Substitui divisão por zero para 1
  f = f.replace(/\/\s*0\b/g, "/1");

  // Ajusta divisor se existir
  const divisorRegex = /\/\s*([0-9]+)/;
  const match = f.match(divisorRegex);
  if (match) {
    const oldDiv = Number(match[1]);
    f = f.replace(divisorRegex, `/ ${Math.max(oldDiv - 1, 1)}`);
  }

  // Remove parenteses vazios
  f = f.replace(/\(\s*\)/g, "0");

  // Se a fórmula ficar inválida, retorna nulo
  if (!f.replace(/[()\d\w\+\-\/*]/g, "").trim() && !f.match(/[A-Za-z0-9]/)) {
    return null;
  }

  return f;
}
