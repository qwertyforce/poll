"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add_ip = exports.vote = exports.create_new_poll = exports.find_poll_by_id = void 0;
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/';
var crypto_1 = __importDefault(require("crypto"));
var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
var db_main = 'user_data';
var client = new MongoClient(url, options);
client.connect(function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Connected successfully to db server");
    }
});
function findDocuments(collection_name, selector) {
    return __awaiter(this, void 0, void 0, function () {
        var collection, result;
        return __generator(this, function (_a) {
            collection = client.db(db_main).collection(collection_name);
            result = collection.find(selector).toArray();
            return [2 /*return*/, result];
        });
    });
}
function removeDocument(collection_name, selector) {
    return __awaiter(this, void 0, void 0, function () {
        var collection;
        return __generator(this, function (_a) {
            collection = client.db(db_main).collection(collection_name);
            collection.deleteOne(selector);
            return [2 /*return*/];
        });
    });
}
function insertDocuments(collection_name, documents) {
    return __awaiter(this, void 0, void 0, function () {
        var collection;
        return __generator(this, function (_a) {
            collection = client.db(db_main).collection(collection_name);
            collection.insertMany(documents);
            return [2 /*return*/];
        });
    });
}
function updateDocument(collection_name, selector, update) {
    return __awaiter(this, void 0, void 0, function () {
        var collection;
        return __generator(this, function (_a) {
            collection = client.db(db_main).collection(collection_name);
            collection.updateOne(selector, { $set: update });
            return [2 /*return*/];
        });
    });
}
function addToArrayInDocument(collection_name, selector, update) {
    return __awaiter(this, void 0, void 0, function () {
        var collection;
        return __generator(this, function (_a) {
            collection = client.db(db_main).collection(collection_name);
            collection.updateOne(selector, { $push: update });
            return [2 /*return*/];
        });
    });
}
function generate_id() {
    return __awaiter(this, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            id = new Promise(function (resolve, reject) {
                crypto_1.default.randomBytes(32, function (ex, buffer) {
                    return __awaiter(this, void 0, void 0, function () {
                        var id, users, id_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (ex) {
                                        reject("error");
                                    }
                                    id = buffer.toString("base64");
                                    return [4 /*yield*/, find_poll_by_id(id)]; //check if id exists
                                case 1:
                                    users = _a.sent() //check if id exists
                                    ;
                                    if (!(users.length === 0)) return [3 /*break*/, 2];
                                    resolve(id);
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, generate_id()];
                                case 3:
                                    id_1 = _a.sent();
                                    resolve(id_1);
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                });
            });
            return [2 /*return*/, id];
        });
    });
}
function find_poll_by_id(id) {
    return __awaiter(this, void 0, void 0, function () {
        var poll;
        return __generator(this, function (_a) {
            poll = findDocuments("polls", {
                id: id
            });
            return [2 /*return*/, poll];
        });
    });
}
exports.find_poll_by_id = find_poll_by_id;
function create_new_poll(question, options, security_level, require_captcha, ban_tor) {
    return __awaiter(this, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, generate_id()];
                case 1:
                    id = _a.sent();
                    insertDocuments("polls", [{
                            id: id,
                            question: question,
                            options: options,
                            security_level: security_level,
                            require_captcha: require_captcha,
                            ban_tor: ban_tor,
                            ips: []
                        }]);
                    return [2 /*return*/, id];
            }
        });
    });
}
exports.create_new_poll = create_new_poll;
function vote(poll_id, options_id) {
    return __awaiter(this, void 0, void 0, function () {
        var collection, result;
        return __generator(this, function (_a) {
            collection = client.db(db_main).collection("poll");
            result = collection.updateOne({ id: poll_id, "options.id": options_id }, { $inc: { numbers: 1 } });
            return [2 /*return*/, result];
        });
    });
}
exports.vote = vote;
function add_ip(poll_id, ip) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            addToArrayInDocument("polls", { id: poll_id }, { ips: ip });
            return [2 /*return*/];
        });
    });
}
exports.add_ip = add_ip;
