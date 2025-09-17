// Autor: Allan Giovanni Matias Paes


import { DatabaseClient } from '../../../db/DBClient';
import { InstitutionDataModel, ProfessorDataModel } from 'dataModels';

const db = new DatabaseClient();
async function testProfessorCRUD() {
    // Instância do client

    // Podem ver os tipos em: types/data-models.d.ts
    // db.table<TipoDataModel>("tipo");
    const professorClient = db.table<ProfessorDataModel>("professor");

    console.log("=== TESTE DE CRUD PROFESSOR ===");

    // INSERT
    console.log("\nInserindo professor (Não pode colocar numa variavel igual os selects)...");
    await professorClient.insert({
        name: "ProfTeste",
        email: "joao@exemplo.co",
        phone: "11999999999",
        password: "senha123",
    });

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

async function testInstitutionCRUD(){
    const institutionClient = db.table<InstitutionDataModel>('institution');

    await institutionClient.insert({name: 'Instituicao1'});

    const findINstitutionByName = await institutionClient.findUnique({name: 'Instituicao1'});
    console.log(findINstitutionByName);

    await institutionClient.update({name: 'InstituicaoAtualizada'}, {name: 'Instituicao1'});
    const findInstitutionUpdated = await institutionClient.findUnique({name:'InstituicaoAtualizada'});

    console.log(findInstitutionUpdated);

    await institutionClient.deleteMany({name: 'InstituicaoAtualizada'});


    const tryFindInstitution = await institutionClient.findUnique({name:'InstituicaoAtualizada'});
    console.log("deve ser null", tryFindInstitution);
    
    
}

// Executa o teste
testProfessorCRUD().catch((err) => {
    console.error("Erro no teste de CRUD:", err);
});


testInstitutionCRUD().catch((err) => {
    console.error('Erro no teste de instituição');
})