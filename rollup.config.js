import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
    input: 'js/app.js',
    output: {
        file: 'bundle.js',
        format: 'iife',
    },
    plugins: [resolve({ preferBuiltins: true }), commonjs(), builtins(), globals()],
};
