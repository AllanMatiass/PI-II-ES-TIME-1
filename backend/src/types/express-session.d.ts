import { ProfessorDataModel } from 'dataModels'
import 'express-session'

declare module 'express-session' {
    interface SessionData {
        user?: ProfessorDataModel
    }
}