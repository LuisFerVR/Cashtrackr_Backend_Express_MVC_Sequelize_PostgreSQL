import request from "supertest";
import app, { connectDB } from "../../server";
import { AuthController } from "../../controllers/AuthController";
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

    it("should return 409 code when a user is already registered", async () => {
        const userData = {
            "name":"test",
            "password":"12345678",
            "email":"tets@gmail.com"
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