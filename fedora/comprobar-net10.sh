#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
command -v python3 >/dev/null || { echo 'Falta python3: sudo dnf install -y python3' >&2; exit 1; }
python3 - "$ROOT" <<'PYCODE'
from pathlib import Path
import sys, xml.etree.ElementTree as ET
root=Path(sys.argv[1]); projects=list(root.rglob('*.csproj'))
if len(projects)!=31: raise SystemExit(f'Se esperaban 31 proyectos; encontrados: {len(projects)}')
for p in projects:
    t=ET.parse(p).getroot()
    fw=t.findtext('./PropertyGroup/TargetFramework')
    if fw!='net10.0': raise SystemExit(f'Framework incorrecto en {p}: {fw}')
    for pkg in t.findall('.//PackageReference'):
        name=pkg.get('Include','')
        ver=pkg.get('Version',pkg.findtext('Version',''))
        if name.startswith(('Microsoft.AspNetCore.', 'Microsoft.EntityFrameworkCore.', 'Microsoft.Extensions.')) and not ver.startswith('10.'):
            raise SystemExit(f'Paquete Microsoft sin actualizar: {p}: {name} {ver}')
print('OK: 31 proyectos net10.0 y paquetes oficiales principales compatibles.')
PYCODE
command -v dotnet >/dev/null || { echo 'Falta dotnet 10. Instale: sudo dnf install -y dotnet-sdk-10.0' >&2; exit 1; }
dotnet --list-sdks | grep -qE '^10\.' || { echo 'Falta SDK .NET 10.' >&2; exit 1; }
cd "$ROOT"
dotnet restore NorthWind.sln
dotnet build NorthWind.sln --no-restore --nologo
printf '\nOK: Compilación de NorthWind.sln con .NET 10 completada.\n'
