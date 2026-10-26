import {BadRequestError} from "../errors/BadRequestError.js";

export const validarSchema = (schema)=>{
    return (req, res, next)=> {
        const resultado = schema.safeParse(req.body);

        if(resultado.error){
            const detalles = resultado.error.issues.map(i=>i.message).join(", ");
            return next (new BadRequestError(`Datos inválidos: ${detalles}`));
        }
        req.body = resultado.data;
        next();
    };
};

export const validarQuerySchema = (schema) => {
    return (req, res, next) => {
        const resultado = schema.safeParse(req.query);
        if (resultado.error) {
            const detalles = resultado.error.issues.map((i) => i.message).join(", ");
            return next(new BadRequestError(`Parámetros inválidos: ${detalles}`));
        }
        req.query = resultado.data;
        next();
    };
};





