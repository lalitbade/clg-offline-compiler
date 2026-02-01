const { exec } = require("child_process");
const fs = require("fs");

/* ----------------- Contest State ----------------- */
let contestMode = false;

/* ----------------- Templates ----------------- */
const templates = {
  python: `a, b = map(int, input().split())
print(a + b)
`,

  cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}
`,

  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}
`
};

/* ----------------- Editor ----------------- */
const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/python");
editor.setValue(templates.python, -1);
editor.setFontSize(18);
editor.setOptions({ showPrintMargin: false });

/* ----------------- Language Switch ----------------- */
document.getElementById("language").addEventListener("change", e => {
  const lang = e.target.value;
  editor.session.setMode(
    lang === "cpp" ? "ace/mode/c_cpp" : `ace/mode/${lang}`
  );
  editor.setValue(templates[lang], -1);
});

/* ----------------- Contest Toggle ----------------- */
function toggleContest() {
  contestMode = !contestMode;
  const btn = document.getElementById("modeBtn");
  btn.innerText = contestMode ? "Contest Mode" : "Practice Mode";
}

window.toggleContest = toggleContest;

/* ----------------- Run Code ----------------- */
function runCode() {
  const code = editor.getValue();
  const lang = document.getElementById("language").value;
  const input = document.getElementById("input").value;

  if (!fs.existsSync("temp")) fs.mkdirSync("temp");
  if (!fs.existsSync("submissions")) fs.mkdirSync("submissions");

  fs.writeFileSync("temp/input.txt", input);

  let cmd = "";
  let ext = "";

  if (lang === "python") {
    ext = "py";
    fs.writeFileSync("temp/code.py", code);
    cmd = "python3 temp/code.py < temp/input.txt";
  }

  if (lang === "cpp") {
    ext = "cpp";
    fs.writeFileSync("temp/code.cpp", code);
    cmd = "g++ temp/code.cpp -o temp/a && temp/a < temp/input.txt";
  }

  if (lang === "java") {
    ext = "java";
    fs.writeFileSync("temp/Main.java", code);
    cmd = "javac temp/Main.java && java -cp temp Main < temp/input.txt";
  }

  exec(cmd, (err, stdout, stderr) => {
    document.getElementById("output").innerText =
      stdout || stderr || "No Output";

    /* ---------- Submission Logging ---------- */
    if (contestMode) {
      const time = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `submissions/${lang}_${time}.${ext}`;
      fs.writeFileSync(filename, code);
    }
  });
}

window.runCode = runCode;
