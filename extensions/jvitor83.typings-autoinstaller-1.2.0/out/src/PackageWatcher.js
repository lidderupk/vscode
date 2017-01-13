"use strict";
var PackageWatcher = (function () {
    function PackageWatcher(packageJson) {
        this.packageJson = packageJson;
    }
    PackageWatcher.prototype.changed = function (changedPackage, detectedChangesCallback) {
        var newPackages = { dependencies: {}, devDependencies: {}, engines: {} };
        var deletedPackes = { dependencies: {}, devDependencies: {}, engines: {} };
        //engines
        for (var key in changedPackage.engines) {
            if (this.exisitsPackage(this.packageJson.engines, key)) {
                newPackages.engines[key] = changedPackage.engines[key];
            }
        }
        if (this.packageJson.engines == undefined) {
            for (var key in changedPackage.engines) {
                newPackages.engines[key] = changedPackage.engines[key];
            }
        }
        if (changedPackage.engines == undefined) {
            for (var key in this.packageJson.engines) {
                deletedPackes.engines[key] = this.packageJson.engines[key];
            }
        }
        for (var key in this.packageJson.engines) {
            if (this.exisitsPackage(changedPackage.engines, key)) {
                deletedPackes.engines[key] = this.packageJson.engines[key];
            }
        }
        //engines
        for (var key in changedPackage.dependencies) {
            if (this.exisitsPackage(this.packageJson.dependencies, key)) {
                newPackages.dependencies[key] = changedPackage.dependencies[key];
            }
        }
        for (var key in changedPackage.devDependencies) {
            if (this.exisitsPackage(this.packageJson.devDependencies, key)) {
                newPackages.devDependencies[key] = changedPackage.devDependencies[key];
            }
        }
        if (this.packageJson.devDependencies == undefined) {
            for (var key in changedPackage.devDependencies) {
                newPackages.devDependencies[key] = changedPackage.devDependencies[key];
            }
        }
        if (this.packageJson.dependencies == undefined) {
            for (var key in changedPackage.dependencies) {
                newPackages.dependencies[key] = changedPackage.dependencies[key];
            }
        }
        if (changedPackage.dependencies == undefined) {
            for (var key in this.packageJson.dependencies) {
                deletedPackes.dependencies[key] = this.packageJson.dependencies[key];
            }
        }
        if (changedPackage.devDependencies == undefined) {
            for (var key in this.packageJson.devDependencies) {
                deletedPackes.devDependencies[key] = this.packageJson.devDependencies[key];
            }
        }
        for (var key in this.packageJson.dependencies) {
            if (this.exisitsPackage(changedPackage.dependencies, key)) {
                deletedPackes.dependencies[key] = this.packageJson.dependencies[key];
            }
        }
        for (var key in this.packageJson.devDependencies) {
            if (this.exisitsPackage(changedPackage.devDependencies, key)) {
                deletedPackes.devDependencies[key] = this.packageJson.devDependencies[key];
            }
        }
        this.packageJson = changedPackage;
        detectedChangesCallback(newPackages, deletedPackes);
    };
    PackageWatcher.prototype.exisitsPackage = function (dependencies, key) {
        if (dependencies != null) {
            return !dependencies.hasOwnProperty(key);
        }
        return false;
    };
    return PackageWatcher;
}());
exports.PackageWatcher = PackageWatcher;
//# sourceMappingURL=PackageWatcher.js.map