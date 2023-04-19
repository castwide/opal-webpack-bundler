const path = require('path');
const ChildProcess = require('child_process');
const LoaderUtils = require('loader-utils');
const shellEscape = require('shell-escape');

var getBundledGems = function (options) {
    return new Promise((resolve, reject) => {
        if (options.useBundler) {
            let child = ChildProcess.spawn('bundle', ['exec', 'ruby', `"${path.resolve(__dirname, 'bundle-gems.rb')}"`], { shell: true, env: process.env });
            let result = '';
            child.stdout.on('data', (buffer) => {
                result += buffer.toString();
            });
            child.on('exit', (status) => {
                if (status == 0) {
                    resolve(result.split(/\r?\n/).filter((e) => { return !!e }));
                } else {
                    reject(new Error('Failed to collect bundled gems'));
                }
            });
        } else {
            resolve([]);
        }
    });
}

var compileScript = function (gems, file, options) {
    return new Promise((resolve, reject) => {
        let cmd = 'ruby';
        let args = [`"${path.resolve(__dirname, 'compile-opal.rb')}"`];
        if (options.useBundler) {
            cmd = 'bundle'
            args = ['exec', 'ruby', `"${path.resolve(__dirname, 'compile-opal.rb')}"`];
        }
        let data = {};
        data.gems = [];
        gems.forEach((g) => {
            data.gems.push(g);
        });
        (options.gems || []).forEach((g) => {
            data.gems.push(g);
        });
        data.paths = [];
        (options.paths || []).forEach((p) => {
            data.paths.push(p);
        });
        data.file = file;
        data.relative = path.relative(options.root || '', file);
        data.root = options.root;
        data.sourcemap = !!options.sourceMap;
        args.push(shellEscape([JSON.stringify(data)]));
        let child = ChildProcess.spawn(cmd, args, { shell: true, env: process.env });
        let result = '';
        child.stdout.on('data', (buffer) => {
            result += buffer.toString();
        });
        child.stderr.on('data', (buffer) => {
            console.error(buffer.toString());
        });
        child.on('exit', (status) => {
            if (status == 0) {
                resolve(JSON.parse(result));
            } else {
                reject(new Error('Opal exited with status ' + status));
            }
        });
    });
}

module.exports = function (source, map, meta) {
    let file = this.resourcePath;
    let options = LoaderUtils.getOptions(this);
    return new Promise((resolve, reject) => {
        getBundledGems(options).then((gems) => {
            return compileScript(gems, file, options).then((result) => {
                // @todo This section informs Webpack of the Ruby project's
                //   dependencies. It might not be strictly necessary, or there
                //   might be a better to do it.
                const fixedRoot = options.root.replace(/\\/g, '/');
                result.files.filter((file) => {
                    return file.startsWith(fixedRoot) && file != fixedRoot;
                }).map((file) => {
                    return path.normalize(file);
                }).forEach((file) => {
                    this.addDependency(file);
                });
                // @todo This is the correct way to send a source map from a
                //   loader, but Webpack isn't able to use the ones that Opal
                //   generates.
                resolve(result.source, result.source_map);
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    });
}
