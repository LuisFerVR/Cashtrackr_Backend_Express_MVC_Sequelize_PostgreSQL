import request from "supertest";
import app, { connectDB } from "../../server";
import { AuthController } from "../../controllers/AuthController";
import User from "../../models/User";
import * as authUtils from "../../utils/auth"
import * as jwtUtils from "../../utils/jwt"

describe("Authentication - Create Account", () => {

    it("should display validation errors when form is empty", async () => {
        const response = await request(app).post("/api/auth/create-acount").send({});
        const createAccountMock = jest.spyOn(AuthController, 'createAccount');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(3);
        expect(createAccountMock).not.toHaveBeenCalled();
    })

    it("should return 400 when the email is invalid", async () => {
        const response = await request(app).post("/api/auth/create-acount").send({
            "name": "Luis",
            "email": "invalid-email",
            "password": "12345678"
        });
        const createAccountMock = jest.spyOn(AuthController, 'createAccount');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(1);
        expect(createAccountMock).not.toHaveBeenCalled();
        expect(response.body.errors[0].msg).toBe("El correo electrónico no es válido")
    })

    it("should return 400 when the password is invalid", async () => {
        const response = await request(app).post("/api/auth/create-acount").send({
            "name": "Luis",
            "email": "luis@gmail.com",
            "password": "invalid"
        });
        const createAccountMock = jest.spyOn(AuthController, 'createAccount');
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(1);
        expect(createAccountMock).not.toHaveBeenCalled();
        expect(response.body.errors[0].msg).toBe("La contraseña debe tener al menos 8 caracteres")
    })

    it("should register a new user successfully", async () => {
        const userData = {
            "name":"test",
            "password":"12345678",
            "email":"test@gmail.com"
        };

        const response = await request(app).post("/api/auth/create-acount").send(userData);
        console.log("Response: ", response.body);
        
        
        expect(response.status).toBe(201);
        expect(response.status).not.toBe(400);
        expect(response.body).not.toHaveProperty("errors");
    })

    it("should return 409 code when a user is already registered", async () => {
        const userData = {
            "name":"test",
            "password":"12345678",
            "email":"test@gmail.com"
        };

        const response = await request(app).post("/api/auth/create-acount").send(userData);
        
        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("El correo electrónico ya está en uso");
        expect(response.status).not.toBe(400);
        expect(response.status).not.toBe(201);
        expect(response.body).not.toHaveProperty("errors");
    },10000)
});

describe("Authentication - Account confirmation with token", () => {
    it('should return error if token is empty or token is not valid', async () => {
        const response = await request(app).post("/api/auth/confirm-account").send({ token: "not_valid" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].msg).toBe("El token no es válido");
    })

    it('should return error if token is empty or token is not valid', async () => {
        const response = await request(app).post("/api/auth/confirm-account").send({ token: "123456" });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Token no válido");
        expect(response.status).not.toBe(200);
    })

    it('should return error if token doesn´t exists', async () => {
        const response = await request(app).post("/api/auth/confirm-account").send({ token: "123456" });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Token no válido");
        expect(response.status).not.toBe(200);
    })

    it('should confirm account with a valid token', async () => {
        const token = globalThis.cashTrackrConfirmationToken;
        
        const response = await request(app).post("/api/auth/confirm-account").send({ token });

        expect(response.status).toBe(200);
        expect(response.body).toBe("Cuenta confirmada correctamente, ya puede iniciar sesión");
        expect(response.status).not.toBe(401);
    })
})

describe("Authentication - Login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display validation error when te form is empty', async () => {
        const response = await request(app).post("/api/auth/login").send({});
        const loginMock = jest.spyOn(AuthController, 'login');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(2);
        expect(response.body.errors).not.toHaveLength(1);
        expect(loginMock).not.toHaveBeenCalled();
    })

    it('should return 400 bad request when the email is invalid', async () => {
        const response = await request(app).post("/api/auth/login").send({
            "email": "invalid-email",
            "password": "12345678"

        });
        const loginMock = jest.spyOn(AuthController, 'login');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors).not.toHaveLength(2);
        expect(response.body.errors[0].msg).toBe("Correo inválido");
        expect(loginMock).not.toHaveBeenCalled();
    })

    it('should return 400 error if the user is not found', async () => {
        const response = await request(app).post("/api/auth/login").send({
            "email": "user_not_found@test.com",
            "password": "12345678"

        });

        expect(response.status).toBe(404);
        expect(response.status).not.toBe(200);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Usuario no encontrado");
    })

    it('should return 403 error if the user account is not confirmed', async () => {
        (jest.spyOn(User, 'findOne')as jest.Mock).mockResolvedValue({
            id:1,
            confirmed: false,
            password: "hashedPassword",
            email:"user_not_confirmed@test.com"
        })
        
        const response = await request(app).post("/api/auth/login").send({
            "email": "user_not_confirmed@test.com",
            "password": "password"

        });

        expect(response.status).toBe(403);
        expect(response.status).not.toBe(200);
        expect(response.status).not.toBe(404);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("La cuenta no ha sido confirmada");
    })
    
    it('should return 403 error if the user account is not confirmed real case', async () => {
        //Flujo norma - Un usuario crea su cuenta y no la confirma
        const userData ={
            name:"test",
            password:"password",
            email:"user_not_confirmed@test.com"
        }
        await request(app).post("/api/auth/create-acount").send(userData);

        // Sin que confirme la cuenta, intenta iniciar sesión
        const response = await request(app).post("/api/auth/login").send({
            "email": userData.email,
            "password": userData.password

        });

        expect(response.status).toBe(403);
        expect(response.status).not.toBe(200);
        expect(response.status).not.toBe(404);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("La cuenta no ha sido confirmada");
    })

    it('should return 401 error if the password is incorrect', async () => {
        const findOne = (jest.spyOn(User, 'findOne')as jest.Mock).mockResolvedValue({
            id:1,
            confirmed: true,
            password: "hashedPassword",
        });
        
        const comparePassword = (jest.spyOn(authUtils,'comparePassword')as jest.Mock).mockResolvedValue(false);

        const response = await request(app).post("/api/auth/login").send({
            "email": "test@test.com",
            "password": "wrongPassword"

        });

        expect(response.status).toBe(403);
        expect(response.status).not.toBe(200);
        expect(response.status).not.toBe(404);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Contraseña incorrecta");
        expect(comparePassword).toHaveBeenCalledTimes(1);
        expect(findOne).toHaveBeenCalledTimes(1);
    })

    it('should return 200 status code if the token is generate', async () => {
        const findOne = (jest.spyOn(User, 'findOne')as jest.Mock).mockResolvedValue({
            id:500,
            confirmed: true,
            password: "hashedPassword",
        });
        
        const comparePassword = (jest.spyOn(authUtils,'comparePassword')as jest.Mock).mockResolvedValue(true);
        const JWT = (jest.spyOn(jwtUtils,'generateJWT')as jest.Mock).mockReturnValue("token_value");

        const response = await request(app).post("/api/auth/login").send({
            "email": "test@test.com",
            "password": "correctPassword"
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual("token_value");
        expect(findOne).toHaveBeenCalledTimes(1);
        expect(comparePassword).toHaveBeenCalledTimes(1);
        expect(comparePassword).toHaveBeenCalledWith("correctPassword", "hashedPassword");
        expect(JWT).toHaveBeenCalledTimes(1);
        expect(JWT).toHaveBeenCalledWith(500);
    })
})

let jwt:string;
async function authenticateUser () {

    const response = await request(app).post("/api/auth/login").send({
        email:"test@gmail.com",
        password:"12345678"
    });
    
    jwt = response.body;
    expect(response.status).toBe(200);
}

describe("GET /api/budgets", () => {

    beforeAll(() => {
        jest.restoreAllMocks(); //Restautra las funciones de los jest.spyOn a su implementación original
    });

    beforeAll(async () => {
        await authenticateUser();
    });

    it("should reject unauthenticated access to budgets without a jwt", async () => {
        const response = await request(app).get("/api/budgets");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("No autorizado");

    })

    it("should reject unauthenticated access to budgets without a valid jwt", async () => {
        const response = await request(app).get("/api/budgets").auth("invalid-jwt",{type:'bearer'});

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Token inválido");

    })

    it("should allow authenticated access to budgets with a valid jwt", async () => {
        
        const response = await request(app).get("/api/budgets").auth(jwt,{type:'bearer'});

        expect(response.status).not.toBe(401);
        expect(response.body.error).not.toBe("No autorizado");
        //expect(response.body).toHaveLength(0);

    })
})

describe("POST /api/budgets", () => {

    beforeAll(async () => {
        await authenticateUser();
    });

    it("should reject unauthenticated post request to budgets without a jwt", async () => {
        const response = await request(app).post("/api/budgets");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("No autorizado");

    })

    it("should display validation when the form is submitted with invalid data", async () => {
        const response = await request(app).post("/api/budgets").auth(jwt,{type:'bearer'}).send({});

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(4);

    })

    it("should display success message when the budget is save", async () => {
        const response = await request(app).post("/api/budgets").auth(jwt,{type:'bearer'}).send({
            name:"Test Budget",
            amount: 1000,
        });

        expect(response.status).toBe(201);
        expect(response.body).toBe("Presupuesto creado correctamente");
    })


})

describe("GET /api/budgets/:budgetId", () => {

    beforeAll(async () => {
        await authenticateUser();
    });

    it("should reject unauthenticated get request to budget id without a jwt", async () => {
        const response = await request(app).get("/api/budgets/1");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("No autorizado");

    })

    it("should return 400 bad request when url is not valid", async () => {
        const response = await request(app).get("/api/budgets/id_not_valid").auth(jwt, {type:'bearer'});
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeTruthy();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].msg).toBe("budgetId inválido");
        expect(response.status).not.toBe(401);
        expect(response.body.error).not.toBe("No autorizado");

    })

    it("should return 404 bad request when id is not found", async () => {
        const response = await request(app).get("/api/budgets/500").auth(jwt, {type:'bearer'});
        
        expect(response.status).toBe(404);
        expect(response.body.message).toBe(`No se encontro el presupuesto con budgetId: ${500}`);
        expect(response.status).not.toBe(401);
        expect(response.body.error).not.toBe("No autorizado");

    })

    it("should return a single budget by id", async () => {
        const response = await request(app).get("/api/budgets/1").auth(jwt, {type:'bearer'});
        
        expect(response.status).toBe(200);
        expect(response.status).not.toBe(400);
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(404);
        expect(response.body.error).not.toBe("No autorizado");

    })
})

describe("PUT /api/budgets/:budgetId", () => {

    beforeAll(async () => {
        await authenticateUser();
    });

    it("should reject unauthenticated put request to budget id without a jwt", async () => {
        const response = await request(app).put("/api/budgets/1");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("No autorizado");

    })

    it("should display validation errors if the form is empty", async () => {
        const response = await request(app).put("/api/budgets/1").auth( jwt ,{type:'bearer'}).send({});

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeTruthy();
        expect(response.body.errors).toHaveLength(4);

    })

    it("should update a budget by id and return a success message", async () => {
        const response = await request(app).put("/api/budgets/1").auth( jwt ,{type:'bearer'}).send({
            name:"Updated Budget",
            amount: 1000,
        });
        

        expect(response.status).toBe(200);
        expect(response.body).toBe("Presupuesto actualizado correctamente");

    })
})

describe("DELETE /api/budgets/:budgetId", () => {

    beforeAll(async () => {
        await authenticateUser();
    });

    it("should reject unauthenticated put request to budget id without a jwt", async () => {
        const response = await request(app).delete("/api/budgets/1");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("No autorizado");

    })

    it("should return 404 not found when a budget doesnt exists", async () => {
        const response = await request(app).delete("/api/budgets/3000").auth( jwt ,{type:'bearer'});

        expect(response.status).toBe(404);
        
        expect(response.body.message).toBe(`No se encontro el presupuesto con budgetId: ${3000}`);

    })

    it("should delete a budget and return a success message", async () => {
        const response = await request(app).delete("/api/budgets/1").auth( jwt ,{type:'bearer'});
        

        expect(response.status).toBe(200);
        expect(response.body).toBe("Presupuesto eliminado correctamente");

    })
})
