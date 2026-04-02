#!/bin/sh
# Wrapper around hermesc that suppresses undeclared-variable warnings.
# These warnings come from JS runtime globals (setTimeout, Promise, Blob, etc.)
# that Hermes's static analyser can't resolve but are provided by React Native.
REAL_HERMESC="${PODS_ROOT}/hermes-engine/destroot/bin/hermesc"
exec "$REAL_HERMESC" -w "$@"
