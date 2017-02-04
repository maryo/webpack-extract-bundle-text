const vm = require('vm');
const RawSource = require('webpack-sources').RawSource;

class ExtractBundleTextPlugin
{
    constructor(options)
    {
        this.options = typeof options === 'string' ? {chunkName: options, outputFile: options} : options;
    }

    apply(compiler)
    {
        compiler.plugin('emit', this.extract.bind(this));
    }

    extract(compilation, callback)
    {
        const script = new vm.Script(this.compile(compilation), {displayErrors: true});
        const sandbox = {
            extractBundleTextPluginCallback: (module) => {
                compilation.assets[this.options.outputFile] = new RawSource(module.exports.toString());
                callback();
            }
        };
        sandbox.window = sandbox;
        script.runInNewContext(sandbox);
    }

    compile(compilation)
    {
        const inputFile = this.options.inputFile || compilation.namedChunks[this.options.chunkName].files[0];
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
