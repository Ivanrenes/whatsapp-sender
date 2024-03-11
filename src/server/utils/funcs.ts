import { exec } from 'child_process';

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
export const killChromiumProcesses = () => {
  console.log('Killing on the fly puppeteer chromium process..');
  exec('pkill -f Chromium');
};
