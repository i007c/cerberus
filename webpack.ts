import TsPaths from 'tsconfig-paths-webpack-plugin'
// import { Configuration } from 'webpack'
import CopyPlugin from 'copy-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'

import { resolve } from 'path'

const BASE_DIR = __dirname
const SRC_DIR = resolve(BASE_DIR, 'src')
const PUBLIC_DIR = resolve(BASE_DIR, 'public')
const DIST_DIR = resolve(BASE_DIR, 'dist')

const Main = {
    entry: SRC_DIR,
    output: {
        path: DIST_DIR,
        clean: true,
        filename: '[name].[contenthash].js',
        sourceMapFilename: 'source_maps/[file].map',
        assetModuleFilename: 'assets/[hash][ext][query]',
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(s|)[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    devtool: 'source-map',
    plugins: [
        // new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerPort: 7777 }),
        new CopyPlugin({
            patterns: [
                {
                    from: PUBLIC_DIR,
                    to: DIST_DIR,
                },
                {
                    from: resolve(BASE_DIR, 'local'),
                    to: resolve(DIST_DIR, 'local'),
                },
            ],
        }),
        new HtmlPlugin({
            template: resolve(SRC_DIR, 'index.html'),
            minify: false,
            // filename: resolve(DIST_DIR, 'index.html')
        }),
    ],
    resolve: {
        extensions: ['.mjs', '.tsx', '.ts', '.js'],
        plugins: [
            new TsPaths({ configFile: resolve(SRC_DIR, 'tsconfig.json') }),
        ],
    },
    optimization: {
        emitOnErrors: false,
        chunkIds: 'deterministic',
        minimize: true,
    },
}

export default Main
