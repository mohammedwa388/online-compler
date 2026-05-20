const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const LANGUAGES = {
  javascript: { ext: '.js', runCmd: (f) => `node "${f}"` },
  python: { ext: '.py', runCmd: (f) => `python3 "${f}"` },
  typescript: { ext: '.ts', runCmd: (f) => `npx ts-node "${f}"` },
  java: {
    ext: '.java',
    runCmd: (f) => {
      const dir = require('path').dirname(f);
      const newPath = require('path').join(dir, 'Main.java');
      return `copy "${f}" "${newPath}" && javac "${newPath}" -d "${dir}" && java -cp "${dir}" Main`;
    },
  },
};

exports.runCode = (req, res) => {
  const { code, language } = req.body;

  if (!code || !language)
    return res
      .status(400)
      .json({ status: 'fail', message: 'ابعت الكود واللغة' });

  const lang = LANGUAGES[language.toLowerCase()];
  if (!lang)
    return res.status(400).json({
      status: 'fail',
      message: `اللغة "${language}" مش مدعومة. المدعومة: ${Object.keys(LANGUAGES).join(', ')}`,
    });

  const tmpFile = path.join(os.tmpdir(), `devflow_${Date.now()}${lang.ext}`);

  fs.writeFile(tmpFile, code, (writeErr) => {
    if (writeErr)
      return res
        .status(500)
        .json({ status: 'error', message: 'فشل في كتابة الملف المؤقت' });

    exec(lang.runCmd(tmpFile), { timeout: 10000 }, (err, stdout, stderr) => {
      fs.unlink(tmpFile, () => {});

      if (err)
        return res
          .status(200)
          .json({ status: 'error', output: stderr || err.message });

      res
        .status(200)
        .json({ status: 'success', output: stdout || '(لا يوجد output)' });
    });
  });
};

exports.getLanguages = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      languages: Object.keys(LANGUAGES).map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        ext: LANGUAGES[id].ext,
      })),
    },
  });
};
