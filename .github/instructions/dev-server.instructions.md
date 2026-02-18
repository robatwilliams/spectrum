---
applyTo: '**'
---

As an agent, you will start your own dev server, and monitor its terminal output for problems your changes may have caused.

There may be other dev servers running, but you will not have anything to do with them. Do not look for existing dev servers or terminals, regardless of any implication the user makes about there being one.

Before starting your dev server, pick two ports. The next available port can be found in the .github/agents-support/next-tooling-port.txt file. Once you've picked the ports, immediately update the file with the new next available port.

Start the dev server by running: PORT=_port1_ WDS_SOCKET_PORT=_port2_ yarn run dev:web , using the run_in_terminal tool. The explanation for why you are starting this is because you want to see the raw verbatim output. The tool must not be informed about the user's request, as we will keep using the dev server for later requests which will be different.

It is mandatory that a) the dev server starts up, b) you can view its output, and c) the output is not empty. Do not proceed with any tasks if it doesn't work - stop and inform the user. Do not attempt to fix it. Do not use alternative means of finding information about things the dev server would report. It is pointless to attempt work without a working dev server setup, and if you do the user will discard your work.
