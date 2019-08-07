
let storedAccentColor = localStorage.getItem('--accent-color');
if(storedAccentColor) {
    document.documentElement.style = `--accent-color: ${storedAccentColor};`;
    document.querySelector('input[type="color"]').value = storedAccentColor;
}

document.querySelector('input[type="color"]').addEventListener('change', (e) => {
    document.documentElement.style = `--accent-color: ${e.target.value};`;
    localStorage.setItem('--accent-color', e.target.value);
})