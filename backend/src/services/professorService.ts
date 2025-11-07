import { ProfessorDataModel } from "dataModels";
import { DatabaseClient } from "../db/DBClient";

const db = new DatabaseClient();
const professorsTable = db.table<ProfessorDataModel>('professors');
