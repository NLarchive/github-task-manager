#!/usr/bin/env node
'use strict';

// Root launch surface for the Agentic IDE bridge server.
// The implementation remains in ../js/bridge-server.js so existing runtime
// imports do not need to move while the folder structure is normalized.
require('../js/bridge-server.js');