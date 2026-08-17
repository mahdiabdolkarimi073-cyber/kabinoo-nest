import * as path from 'node:path';
import * as process from 'node:process';
import * as fs from 'node:fs';
import { Controller, DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

interface MiddlewareConfig {
    path: string;
    middleware: any;
}

@Module({})
export class RoutesModule implements NestModule {
    private static middlewareConfigs: MiddlewareConfig[] = [];

    static forRoot(dir = 'api'): DynamicModule {
        // Reset middleware configs
        this.middlewareConfigs = [];

        const absolute = path.join(process.cwd(), 'dist', 'src', dir);
        const controllers = this.discoverControllersAndMiddleware(absolute);

        return {
            module: RoutesModule,
            controllers: controllers,
            // Don't export the controllers
        };
    }

    private static discoverControllersAndMiddleware(dirPath: string, routePrefix = ''): any[] {
        let controllers: any[] = [];

        if (!fs.existsSync(dirPath)) {
            console.warn(`Directory ${dirPath} does not exist`);
            return controllers;
        }

        try {
            let items = fs.readdirSync(dirPath);

            // First check for middleware
            const middlewareFile = items.find(item => item === 'middleware.js');
            if (middlewareFile) {
                try {
                    const fullPath = path.join(dirPath, middlewareFile);
                    const middlewareModule = require(fullPath);

                    if (middlewareModule.default) {
                        if (Array.isArray(middlewareModule.default)) {
                            // Process middleware configurations
                            middlewareModule.default.forEach((config: any) => {
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
                        } else {
                            const root = path.join('/', routePrefix).replaceAll('\\', '/');

                            this.middlewareConfigs.push({
                                path: root,
                                middleware: middlewareModule.default,
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error loading middleware from ${path.join(dirPath, middlewareFile)}:`, error);
                }
            }

            const statics = items.filter(o => !o.startsWith('index'));
            const indexes = items.filter(o => o.startsWith('index'));
            const finalItems = [
                ...statics.sort((a, b) => a.length <= b.length ? 1 : -1),
                ...indexes,
            ];


            // Then discover controllers
            for (const item of finalItems) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    // Calculate new route prefix for subdirectory
                    const newPrefix = routePrefix
                        ? `${routePrefix}/${item}`
                        : item;

                    // Recursively check subdirectories
                    const subdirControllers = this.discoverControllersAndMiddleware(fullPath, newPrefix);
                    controllers = [
                        ...subdirControllers,
                        ...controllers,
                    ];
                } else if (stat.isFile() && item.endsWith('.js') && item !== 'middleware.js') {
                    try {
                        const imported = require(fullPath);

                        if (imported.default) {
                            // Check if the default export is a controller class
                            const controller = imported.default;

                            // Only add if it appears to be a controller (has a 'prototype')
                            if (controller.prototype) {
                                let name = item.split('.').slice(0, -1).join('.');
                                if (name === 'index') name = '';
                                let cPath = path.join(routePrefix, name).replaceAll('\\', '/');
                                if (cPath === '.') cPath = '/';

                                @Controller(cPath)
                                class Dynamic extends controller {
                                }

                                Dynamic?.onMount?.();

                                controllers.push(Dynamic);
                            }
                        }
                    } catch (error) {
                        console.error(`Error importing controller from ${fullPath}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dirPath}:`, error);
        }

        return controllers;
    }

    configure(consumer: MiddlewareConsumer) {

        // Apply discovered middleware
        RoutesModule.middlewareConfigs.forEach(config => {
            consumer.apply(config.middleware).forRoutes(config.path);
        });
    }
}
