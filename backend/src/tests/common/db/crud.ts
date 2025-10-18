// Autor: Allan Giovanni Matias Paes


import { InstitutionDataModel, ProfessorDataModel } from 'dataModels';
import { DatabaseClient } from '../../../db/DBClient';
import { InstitutionRegisterRequestDTO, ProfessorRegisterRequestDTO, ProfessorResponseDTO } from 'dtos';

const db = new DatabaseClient();
async function testProfessorCRUD() {
    // Instância do client

    // Podem ver os tipos em: types/data-models.d.ts
    // db.table<TipoDataModel>("tipo");
    const professorClient = db.table<ProfessorDataModel>("professor");

    console.log("=== TESTE DE CRUD PROFESSOR ===");

    // INSERT
    console.log("\nInserindo professor (Retorna o ID)");
    // Simulando o que seria o body da requisição
    const requestBody: ProfessorRegisterRequestDTO = {
        name: "ProfTeste",
        phone: "11999999999",
        email: "joao@exemplo.co",
        password: "senha123",
        confirmPassword: "senha123"
    };

    if (requestBody.password !== requestBody.confirmPassword) {
        throw new Error("As senhas não conferem");
    }

    // INSERT (não passa ID porque DatabaseClient gera sozinho)
    console.log("\nInserindo professor...");
    const newProfessorId = await professorClient.insert({
        name: requestBody.name,
        email: requestBody.email,
        phone: requestBody.phone,
        password: requestBody.password,
        created_at: 123
    });

    console.log("ID do professor inserido: ", newProfessorId);


    // FIND UNIQUE
    console.log("\nBuscando professor por email...");
    const professor = await professorClient.findUnique({
        email: "joao@exemplo.co",
    });
    console.log("Professor encontrado:", professor);

    // UPDATE
    console.log("\nAtualizando nome do professor...");
    await professorClient.update(
        { name: "Prof teste Atualizado" },
        { email: "joao@exemplo.co" }
    );

    const updatedProfessor = await professorClient.findUnique({
        email: "joao@exemplo.co",
    });
    console.log("Professor atualizado:", updatedProfessor);

    // FIND MANY
    console.log("\nListando todos os professores...");
    const allProfessors = await professorClient.findMany();
    console.log(allProfessors);

    // DELETE
    console.log("\nRemovendo professor...");
    await professorClient.deleteMany({ email: "joao@exemplo.co" });

    const afterDelete = await professorClient.findUnique({
        email: "joao@exemplo.co",
    });
    console.log("Professor após delete (deve ser null):", afterDelete);

    console.log("\n✅ CRUD finalizado com sucesso!");
}

async function testInstitutionCRUD() {
    const institutionClient = db.table<InstitutionDataModel>('institution');
    console.log("Conexão com a tabela 'institution' criada.");

    console.log("Inserindo instituição...");
    const inserted = await institutionClient.insert({ name: 'Instituicao1' });
    console.log("Instituição inserida:", inserted);

    console.log("Buscando instituição por nome...");
    const findInstitutionByName = await institutionClient.findUnique({ name: 'Instituicao1' });
    console.log("Resultado da busca:", findInstitutionByName);

    console.log("Atualizando nome da instituição...");
    const updated = await institutionClient.update({ name: 'InstituicaoAtualizada' }, { name: 'Instituicao1' });
    console.log("Resultado da atualização:", updated);

    console.log("Buscando instituição atualizada...");
    const findInstitutionUpdated = await institutionClient.findUnique({ name: 'InstituicaoAtualizada' });
    console.log("Instituição após atualização:", findInstitutionUpdated);

    console.log("Deletando instituição...");
    const deleted = await institutionClient.deleteMany({ name: 'InstituicaoAtualizada' });
    console.log("Resultado da deleção:", deleted);

    console.log("Tentando buscar instituição após deletar...");
    const tryFindInstitution = await institutionClient.findUnique({ name: 'InstituicaoAtualizada' });
    console.log("Deve ser null:", tryFindInstitution);
}

// Executa o teste
testProfessorCRUD().catch((err) => {
    console.error("Erro no teste de CRUD:", err);
});


testInstitutionCRUD().catch((err) => {
    console.error('Erro no teste de instituição');
})