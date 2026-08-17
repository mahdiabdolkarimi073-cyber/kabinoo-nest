"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RoutesModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesModule = void 0;
const path = require("node:path");
const process = require("node:process");
const fs = require("node:fs");
const common_1 = require("@nestjs/common");
let RoutesModule = class RoutesModule {
    static { RoutesModule_1 = this; }
    static middlewareConfigs = [];
    static forRoot(dir = 'api') {
        this.middlewareConfigs = [];
        const absolute = path.join(process.cwd(), 'dist', 'src', dir);
        const controllers = this.discoverControllersAndMiddleware(absolute);
        return {
            module: RoutesModule_1,
            controllers: controllers,
        };
    }
    static discoverControllersAndMiddleware(dirPath, routePrefix = '') {
        let controllers = [];
        if (!fs.existsSync(dirPath)) {
            console.warn(`Directory ${dirPath} does not exist`);
            return controllers;
        }
        try {
            let items = fs.readdirSync(dirPath);
            const middlewareFile = items.find(item => item === 'middleware.js');
            if (middlewareFile) {
                try {
                    const fullPath = path.join(dirPath, middlewareFile);
                    const middlewareModule = require(fullPath);
                    if (middlewareModule.default) {
                        if (Array.isArray(middlewareModule.default)) {
                            middlewareModule.default.forEach((config) => {
                                if (config.middleware && Array.isArray(config.middleware)) {
                                    const fullPath = config.path === '*'
                                        ? `/${routePrefix}/*`.replace(/\/\//g, '/')
                                        : `/${routePrefix}/${config.path}`.replace(/\/\//g, '/');
                                    this.middlewareConfigs.push({
                                        path: fullPath,
                                        middleware: config.middleware,
                                    });
                                }
                            });
                        }
                        else {
                            const root = path.join('/', routePrefix).replaceAll('\\', '/');
                            this.middlewareConfigs.push({
                                path: root,
                                middleware: middlewareModule.default,
                            });
                        }
                    }
                }
                catch (error) {
                    console.error(`Error loading middleware from ${path.join(dirPath, middlewareFile)}:`, error);
                }
            }
            const statics = items.filter(o => !o.startsWith('index'));
            const indexes = items.filter(o => o.startsWith('index'));
            const finalItems = [
                ...statics.sort((a, b) => a.length <= b.length ? 1 : -1),
                ...indexes,
            ];
            for (const item of finalItems) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    const newPrefix = routePrefix
                        ? `${routePrefix}/${item}`
                        : item;
                    const subdirControllers = this.discoverControllersAndMiddleware(fullPath, newPrefix);
                    controllers = [
                        ...subdirControllers,
                        ...controllers,
                    ];
                }
                else if (stat.isFile() && item.endsWith('.js') && item !== 'middleware.js') {
                    try {
                        const imported = require(fullPath);
                        if (imported.default) {
                            const controller = imported.default;
                            if (controller.prototype) {
                                let name = item.split('.').slice(0, -1).join('.');
                                if (name === 'index')
                                    name = '';
                                let cPath = path.join(routePrefix, name).replaceAll('\\', '/');
                                if (cPath === '.')
                                    cPath = '/';
                                let Dynamic = class Dynamic extends controller {
                                };
                                Dynamic = __decorate([
                                    (0, common_1.Controller)(cPath)
                                ], Dynamic);
                                Dynamic?.onMount?.();
                                controllers.push(Dynamic);
                            }
                        }
                    }
                    catch (error) {
                        console.error(`Error importing controller from ${fullPath}:`, error);
                    }
                }
            }
        }
        catch (error) {
            console.error(`Error reading directory ${dirPath}:`, error);
        }
        return controllers;
    }
    configure(consumer) {
        RoutesModule_1.middlewareConfigs.forEach(config => {
            consumer.apply(config.middleware).forRoutes(config.path);
        });
    }
};
exports.RoutesModule = RoutesModule;
exports.RoutesModule = RoutesModule = RoutesModule_1 = __decorate([
    (0, common_1.Module)({})
], RoutesModule);
//# sourceMappingURL=FsRouter.js.map