export default {
    use: {
        outputDir: 'test-results', 
    },
    reporter: [
        ['html', { open: 'never' }],
        ['allure-playwright', { outputFolder: 'allure-results' }],
    ],
};