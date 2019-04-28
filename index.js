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

module.exports = function (_source) {
    let file = this.resourcePath;
    let options = LoaderUtils.getOptions(this);
    return new Promise((resolve, reject) => {
        getBundledGems(options).then((gems) => {
            return compileScript(gems, file, options).then((result) => {
                if (result.length == 1) {
                    resolve(result[0]);
                } else {
                    resolve(result[0], result[1]);
                }
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    });
}
