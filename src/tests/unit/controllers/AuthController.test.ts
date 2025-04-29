import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";
import { comparePassword, hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmails } from "../../../emails/AuthEmails";
import { generateJWT } from "../../../utils/jwt";

// Mock explícito para que las funciones existan correctamente
jest.mock("../../../models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  }
}));

jest.mock("../../../utils/auth", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));

jest.mock("../../../utils/token", () => ({
  generateToken: jest.fn()
}));

jest.mock("../../../emails/AuthEmails", () => ({
  AuthEmails: {
    sendConfirmationEmail: jest.fn()
  }
}));

jest.mock("../../../utils/jwt",() => ({
  generateJWT: jest.fn()
}))

describe("AuthController.createAccount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 409 status and an error message if the email is already registered", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(true);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@example.com",
        password: "password123"
      }
    });

    const res = createResponse();

    await AuthController.createAccount(req, res);

    expect(res.statusCode).toBe(409);
    expect(res._getJSONData()).toHaveProperty("error", "El correo electrónico ya está en uso");
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should register a new user and return a success message", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      }
    });

    const res = createResponse();

    const mockSave = jest.fn();

    const mockUser = {
      ...req.body,
      password: req.body.password,
      token: "",
      save: mockSave
    };

    (User.create as jest.Mock).mockResolvedValue(mockUser);
    (hashPassword as jest.Mock).mockReturnValue("hashedPassword");
    (generateToken as jest.Mock).mockReturnValue("123456");
    (AuthEmails.sendConfirmationEmail as jest.Mock).mockResolvedValue(undefined);

    await AuthController.createAccount(req, res);

    expect(User.create).toHaveBeenCalledWith(req.body);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(mockUser.password).toBe("hashedPassword");
    expect(mockUser.token).toBe("123456");
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(AuthEmails.sendConfirmationEmail).toHaveBeenCalledWith({
      name: req.body.name,
      email: req.body.email,
      token: "123456"
    });
    expect(AuthEmails.sendConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual("Usuario creado correctamente");
  });
});

describe("AuthController.login", () => {
  it("should return 404 if user is not found", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@example.com",
        password: "password123"
      }
    });

    const res = createResponse();

    await AuthController.login(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toHaveProperty("error", "Usuario no encontrado");
  });

  it("should return 403 if the account has not been confirmed", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id:1,
      email:"tes@test.com",
      password: "password123",
      confirmed: false,
    });

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@example.com",
        password: "password123"
      }
    });

    const res = createResponse();

    await AuthController.login(req, res);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toHaveProperty("error", "La cuenta no ha sido confirmada");
  });

  it("should return 403 if password is incorrect", async () => {
    const userMock = {
      id:1,
      email:"tes@test.com",
      password: "password123",
      confirmed: true,
    };

    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@example.com",
        password: "password123"
      }
    });

    const res = createResponse();
    (comparePassword as jest.Mock).mockResolvedValue(false);

    await AuthController.login(req, res);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toHaveProperty("error", "Contraseña incorrecta");
    expect(comparePassword).toHaveBeenCalledTimes(1);
    expect(comparePassword).toHaveBeenCalledWith(req.body.password,userMock.password);
  });

  it("should return a JWT if authentication is successful", async () => {
    const userMock = {
      id:1,
      email:"tes@test.com",
      password: "password123",
      confirmed: true,
    };

    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@example.com",
        password: "password123"
      }
    });

    const res = createResponse();

    const fake_JWT = "fake_jwt";
    
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (generateJWT as jest.Mock).mockReturnValue(fake_JWT);
    await AuthController.login(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(fake_JWT);
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenCalledWith(userMock.id);

  });
})