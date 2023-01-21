// import { Configuration } from 'webpack'
import CopyPlugin from 'copy-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
import { resolve } from 'path'
import TsPaths from 'tsconfig-paths-webpack-plugin'

const BASE_DIR = __dirname
const SRC_DIR = resolve(BASE_DIR, 'src')
const PUBLIC_DIR = resolve(BASE_DIR, 'public')
const DIST_DIR = resolve(BASE_DIR, 'dist')

CopyPlugin
PUBLIC_DIR

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
                test: /\.(png|svg|jpg|jpeg|gif|mp4)$/i,
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
            ],
        }),
        new HtmlPlugin({
            template: resolve(SRC_DIR, 'template.html'),
            minify: false,
        }),
    ],
    resolve: {
        extensions: ['.mjs', '.tsx', '.ts', '.js'],
        plugins: [
            new TsPaths({ configFile: resolve(SRC_DIR, 'tsconfig.json') }),
        ],
    },
    // optimization: {
    //     emitOnErrors: false,
    //     chunkIds: 'deterministic',
    //     minimize: true,
    // },
    devServer: {
        port: 8000,
        hot: true, // true = full reload
        historyApiFallback: true,
        compress: true,
        client: {
            logging: 'none',
            reconnect: 7,
        },
    },
}

export default Main
