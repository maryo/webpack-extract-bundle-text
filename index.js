const vm = require('vm');
const RawSource = require('webpack-sources').RawSource;

class ExtractBundleTextPlugin
{
    constructor(options)
    {
        if (!Array.isArray(options)) {
            options = [options];
        }

        this.options = options.map((value) => {
            return typeof value === 'string' || value instanceof String
                ? {chunkName: value, outputFile: value}
                : value;
        });
    }

    apply(compiler)
    {
        compiler.plugin('emit', this.extract.bind(this));
    }

    extract(compilation, callback)
    {
        this.options.forEach((options) => {
            this.extractFile(
                compilation,
                options.inputFile || compilation.namedChunks[options.chunkName].files[0],
                options.outputFile
            );
        });
        callback();
    }

    extractFile(compilation, inputFile, outputFile)
    {
        const script = new vm.Script(this.compile(compilation, inputFile), {displayErrors: true});
        const sandbox = {
            extractBundleTextPluginCallback: (module) => {
                compilation.assets[outputFile] = new RawSource(module.exports.toString());
            }
        };
        sandbox.window = sandbox;
        script.runInNewContext(sandbox);
    }

    compile(compilation, inputFile)
    {
        const manifestFile = compilation.namedChunks.manifest.files[0];
        let source = compilation.assets[manifestFile].source().replace(
            'modules[moduleId].call',
            'if (modules[moduleId]) modules[moduleId].call'
        );
        source += `
            var _webpackJsonp = webpackJsonp;
            var webpackJsonp = function (chunkIds, modules, executeModules) {
                var executeModule = modules[executeModules[0]];
                modules[executeModules[0]] = function (module, exports, webpackRequire) {
                    executeModule.apply(this, arguments);
                    extractBundleTextPluginCallback(module);
                };
                
                _webpackJsonp.apply(this, arguments);
            };
        `;
        source += compilation.assets[inputFile].source();

        return source;
    }
}

module.exports = ExtractBundleTextPlugin;
