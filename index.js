const path = require('path');
const ChildProcess = require('child_process');
const LoaderUtils = require('loader-utils');

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
        let cmd = 'opal';
        let args = ['-c', '--no-opal'];
        if (options.useBundler) {
            cmd = 'bundle'
            args = ['exec', 'opal', '-c', '--no-opal'];
        }
        gems.forEach((g) => {
            if (g != 'opal') {
                args.push('-g', g);
            }
        });
        (options.gems || []).forEach((g) => {
            args.push('-g', `"${g}"`);
        });
        (options.paths || []).forEach((p) => {
            args.push('-I', `"${p}"`);
        });
        args.push(`"${file}"`);
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
                resolve(result);
            } else {
                reject(new Error('Opal exited with status ' + status));
            }
        });
    });
}

module.exports = function (source) {
    var file = LoaderUtils.interpolateName(this, "[path][name].[ext]", {
        source
    }).toString();
    let options = LoaderUtils.getOptions(this);
    return new Promise((resolve, reject) => {
        getBundledGems(options).then((gems) => {
            return compileScript(gems, file, options).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    });
}
