"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lokalise = void 0;
var node_api_1 = require("@lokalise/node-api");
var github_1 = require("@actions/github");
var core = require("@actions/core");
var Lokalise = /** @class */ (function () {
    function Lokalise(params) {
        this.octokit = (0, github_1.getOctokit)(params.ghToken);
        this.project_id = params.project_id;
        this.api = new node_api_1.LokaliseApi({
            apiKey: params.apiKey,
        });
    }
    Object.defineProperty(Lokalise.prototype, "request", {
        get: function () {
            return {
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                ref: github_1.context.sha,
            };
        },
        enumerable: false,
        configurable: true
    });
    Lokalise.prototype.getProjectBranches = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.api.branches().list({ project_id: this.project_id })];
            });
        });
    };
    Lokalise.prototype.deleteBranch = function (branch_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.api
                        .branches()
                        .delete(branch_id, { project_id: this.project_id })];
            });
        });
    };
    Lokalise.prototype.getUpdatedBranchKeys = function (branch_name) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.keys().list({
                            project_id: "".concat(this.project_id, ":").concat(branch_name),
                            filter_tags: branch_name,
                            // filter_untranslated: 1,
                        })];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.items.map(function (key) { return key.key_id; })];
                }
            });
        });
    };
    Lokalise.prototype.getProjectUserGroups = function () {
        return __awaiter(this, void 0, void 0, function () {
            var project;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.projects().get(this.project_id)];
                    case 1:
                        project = _a.sent();
                        return [2 /*return*/, this.api.userGroups().list({ team_id: project.team_id })];
                }
            });
        });
    };
    Lokalise.prototype.getLanguageUserTranslationGroup = function (lang) {
        return __awaiter(this, void 0, void 0, function () {
            var groups;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProjectUserGroups()];
                    case 1:
                        groups = _a.sent();
                        return [2 /*return*/, groups.items.find(function (g) {
                                return g.permissions.languages.find(function (l) { return l.is_writable && l.lang_iso === lang; });
                            })];
                }
            });
        });
    };
    Lokalise.prototype.mergeBranch = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var branches, sourceBrance, targetBranch, res;
            var branch_name = _b.branch_name, target_branch_name = _b.target_branch_name, _c = _b.delete_branch_after_merge, delete_branch_after_merge = _c === void 0 ? false : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.getProjectBranches()];
                    case 1:
                        branches = _d.sent();
                        sourceBrance = branches.items.find(function (b) { return b.name === branch_name; });
                        targetBranch = branches.items.find(function (b) { return b.name === target_branch_name; });
                        if (!sourceBrance)
                            throw new Error("Branch ".concat(branch_name, " not found"));
                        if (!targetBranch)
                            throw new Error("Branch ".concat(target_branch_name, " not found"));
                        return [4 /*yield*/, this.api.branches().merge(sourceBrance.branch_id, { project_id: this.project_id }, {
                                target_branch_id: targetBranch.branch_id,
                                force_conflict_resolve_using: "source", // feat branch changes will win.,
                            })];
                    case 2:
                        res = _d.sent();
                        if (!(delete_branch_after_merge && res.branch_merged)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.deleteBranch(sourceBrance.branch_id)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4: return [2 /*return*/, res];
                }
            });
        });
    };
    Lokalise.prototype.createBranch = function (branch_name) {
        return __awaiter(this, void 0, void 0, function () {
            var branches, existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api
                            .branches()
                            .list({ project_id: this.project_id })];
                    case 1:
                        branches = _a.sent();
                        existing = branches.items.find(function (b) { return b.name === branch_name; });
                        if (existing)
                            return [2 /*return*/, existing];
                        return [2 /*return*/, this.api
                                .branches()
                                .create({ name: branch_name }, { project_id: this.project_id })];
                }
            });
        });
    };
    Lokalise.prototype.upload = function (branch_name, params) {
        return __awaiter(this, void 0, void 0, function () {
            var folder, base64Files, processes, _i, base64Files_1, file, res, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.octokit.rest.repos.getContent(__assign(__assign({}, this.request), { path: "locales/it" }))];
                    case 1:
                        folder = _a.sent();
                        return [4 /*yield*/, Promise.all(folder.data
                                .map(function (f) { return __awaiter(_this, void 0, void 0, function () {
                                var file, base64Content;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.octokit.rest.repos.getContent(__assign(__assign({}, this.request), { path: f.path, mediaType: {
                                                    format: "raw",
                                                } }))];
                                        case 1:
                                            file = _a.sent();
                                            base64Content = Buffer.from(file.data.toString()).toString("base64");
                                            return [2 /*return*/, {
                                                    fileName: f.name,
                                                    base64Content: base64Content,
                                                }];
                                    }
                                });
                            }); })
                                .filter(Boolean))];
                    case 2:
                        base64Files = _a.sent();
                        processes = [];
                        _i = 0, base64Files_1 = base64Files;
                        _a.label = 3;
                    case 3:
                        if (!(_i < base64Files_1.length)) return [3 /*break*/, 6];
                        file = base64Files_1[_i];
                        return [4 /*yield*/, this.api
                                .files()
                                .upload("".concat(this.project_id, ":").concat(branch_name), __assign(__assign({}, params), { format: "json", lang_iso: "it", data: file.base64Content, filename: file.fileName, replace_modified: true, tags: [branch_name] }))];
                    case 4:
                        res = _a.sent();
                        if (res === null || res === void 0 ? void 0 : res.process_id)
                            processes.push(res.process_id);
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, processes];
                    case 7:
                        error_1 = _a.sent();
                        console.log(error_1);
                        return [2 /*return*/, []];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Lokalise.prototype.createTask = function (branch_name, lang) {
        return __awaiter(this, void 0, void 0, function () {
            var group, keys, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getLanguageUserTranslationGroup(lang)];
                    case 1:
                        group = _b.sent();
                        if (!group)
                            throw new Error("No user group found for ".concat(lang));
                        return [4 /*yield*/, this.getUpdatedBranchKeys(branch_name)];
                    case 2:
                        keys = _b.sent();
                        if (!keys || keys.length === 0) {
                            core.info("No ".concat(lang.toUpperCase(), " keys found for ").concat(branch_name, ".. skipping task creation."));
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, this.api.tasks().create({
                                title: "Update ".concat(lang.toUpperCase(), " - ").concat(branch_name),
                                keys: keys,
                                task_type: "review",
                                // !IMPORTANT: Data to be used in the webhook
                                description: JSON.stringify({
                                    owner: github_1.context.repo.owner,
                                    repo: github_1.context.repo.repo,
                                    pull_number: (_a = github_1.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number,
                                    ref: branch_name,
                                }),
                                languages: [
                                    {
                                        language_iso: lang,
                                        groups: [group.group_id],
                                    },
                                ],
                            }, { project_id: "".concat(this.project_id, ":").concat(branch_name) })];
                    case 3:
                        error_2 = _b.sent();
                        console.log(error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Lokalise.prototype.getProjectLanguages = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.api.languages().list({ project_id: this.project_id })];
            });
        });
    };
    Lokalise.prototype.getUploadProcessStatus = function (branch_name, process_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.api
                        .queuedProcesses()
                        .get(process_id, { project_id: "".concat(this.project_id, ":").concat(branch_name) })];
            });
        });
    };
    return Lokalise;
}());
exports.Lokalise = Lokalise;
