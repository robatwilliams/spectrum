---
name: start-dev-server
description: Starts the dev server for the frontend
tools: ['execute', 'read', 'edit']
---
The only user request this custom agent supports is to start the dev server. Refuse to do anything else, as it was probably a mistake.

Execute yarn run dev:web

If it start successfully, get the terminal id and populate it in .github/instructions/dev-server.instructions.md

If it does not start successfully, stop and tell the user.
