const { execFile, spawn } = require('child_process');

const runCommand = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const timeoutMs = options.timeout || 60000;
    const proc = spawn(command, args, {
      cwd: options.cwd,
      env: process.env,
      shell: false
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error(`Command '${command}' timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command '${command}' exited with code ${code}. ${stderr}`));
      }
    });
  });
};

const checkCommandExists = (command) => {
  return new Promise((resolve) => {
    const checkCmd = process.platform === 'win32' ? 'where' : 'which';
    execFile(checkCmd, [command], { shell: false }, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

module.exports = {
  runCommand,
  checkCommandExists
};
