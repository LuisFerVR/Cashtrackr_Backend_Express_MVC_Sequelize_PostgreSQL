import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";
import { hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmails } from "../../../emails/AuthEmails";

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
  hashPassword: jest.fn()
}));

jest.mock("../../../utils/token", () => ({
  generateToken: jest.fn()
}));

jest.mock("../../../emails/AuthEmails", () => ({
  AuthEmails: {
    sendConfirmationEmail: jest.fn()
  }
}));

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
