import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('daily.html', 'utf8');
const copyMatch = html.match(/function copyToClipboard\(text\) \{[\s\S]*?\n\}/);
const helperMatch = html.match(/function copyTextWithFallback\(text, message\) \{[\s\S]*?\n\}/);
const toastMatch = html.match(/function showToast\(msg\) \{[\s\S]*?\n\}/);

if (!copyMatch || !helperMatch || !toastMatch) {
  throw new Error('Could not find copyToClipboard/copyTextWithFallback/showToast in daily.html');
}

async function verifyFallback(mode) {
  let execCommandCalled = false;
  let textareaSelected = false;
  let toastText = '';

  const fakeTextarea = {
    value: '',
    style: {},
    select() {
      textareaSelected = true;
    },
    remove() {}
  };

  const sandbox = {
    navigator: {
      clipboard: {
        writeText() {
          if (mode === 'throw') throw new Error('permission denied');
          return Promise.reject(new Error('permission denied'));
        }
      }
    },
    window: { isSecureContext: true },
    document: {
      body: {
        appendChild() {},
      },
      createElement(tag) {
        if (tag === 'textarea') return fakeTextarea;
        return {
          textContent: '',
          style: { cssText: '' },
          remove() {},
        };
      },
      execCommand(command) {
        if (command === 'copy') execCommandCalled = true;
        return true;
      }
    },
    setTimeout(fn) {
      fn();
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(`${toastMatch[0]}\n${helperMatch[0]}\n${copyMatch[0]}`, sandbox);
  sandbox.showToast = (msg) => { toastText = msg; };

  sandbox.copyToClipboard('hello fallback');
  await new Promise(resolve => setTimeout(resolve, 0));

  if (!execCommandCalled || !textareaSelected || toastText !== '已复制 ✓') {
    throw new Error(`Fallback copy failed in ${mode} mode: execCommand=${execCommandCalled}, selected=${textareaSelected}, toast=${toastText}`);
  }
}

process.on('unhandledRejection', () => {});

await verifyFallback('reject');
await verifyFallback('throw');

console.log('daily copy fallback ok');
