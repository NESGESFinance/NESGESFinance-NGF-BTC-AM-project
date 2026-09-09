# NGF•BTC•AM — información literal institucional actualizada

![NESGESFinance Ecosystem](https://raw.githubusercontent.com/NESGESFinance/NESGESFinanceTrust/main/frontend/assets/img/NESGESFinance_Logo.jpg)
![NGF•BTC•AM](https://raw.githubusercontent.com/NESGESFinance/NESGESFinanceTrust/main/frontend/assets/img/NGF-BTC-AM.jpg)

**NESGESFinance Ecosystem S.A.S. BIC. & LLC.**  
Versión documental: **2026**

Este repositorio consolida la información literal actualizada del activo **NGF•BTC•AM** y la alinea con la identidad visual e institucional publicada en el frontend de **NESGESFinanceTrust**.

---

## Estado institucional

NGF•BTC•AM se presenta como un **Rune de utilidad sobre Bitcoin L1** dentro de la arquitectura de NESGESFinance. La capa **NESGESFinanceTrust** figura como una plataforma técnica e institucional propuesta, en proceso de formalización y actualmente en **etapa de auditoría técnica y testeo de conectores**.

La información aquí publicada es **institucional, técnica e informativa**. No constituye oferta pública de valores, mercado público, servicio de custodia, asesoría financiera, jurídica o fiscal, ni certificación independiente.

---

## Identidad del activo

| Campo | Valor |
|---|---|
| **Rune** | NGF•BTC•AM |
| **Número declarado** | #208,645 |
| **Rune ID** | `923867:120` |
| **Nombre** | NGF•BTC•AM — NESGESFinance Utility Rune |
| **Naturaleza** | Utility token / Fungible Rune |
| **Red** | Bitcoin Mainnet |
| **Protocolo primario** | Runes Protocol sobre Bitcoin L1 |
| **Capas relacionadas** | Lightning y Taproot Assets se tratan como capas separadas u opcionales, no como envoltorios automáticos de NGF•BTC•AM |
| **Supply total** | 5.930.000.000 |
| **Divisibilidad** | 0 |
| **Mintable** | No |
| **Burnable** | No |

---

## Propósito y funciones declaradas

NGF•BTC•AM se describe como una pieza de infraestructura funcional del ecosistema NESGESFinance. Sus funciones declaradas son:

1. **Identidad digital** dentro del ecosistema.  
2. **Acceso técnico** a módulos, launchpad y servicios autorizados.  
3. **Participación funcional** en procesos y flujos on-chain.  
4. **Gobernanza consultiva** sobre parámetros generales del ecosistema.  
5. **Unidad de cuenta** para referencias internas, umbrales y tarifas.

El token **no otorga derechos económicos directos sobre proyectos**. Los derechos específicos de cada serie corresponden exclusivamente a la documentación y a los instrumentos definidos para cada proyecto.

---

## Estructura corporativa declarada

| Entidad | Jurisdicción / identificador declarado | Función documentada |
|---|---|---|
| **NESGESFinance Ecosystem S.A.S. BIC** | Ecuador, Ibarra (Imbabura) · RUC 1091799299001 | Coordinación tecnológica y operaciones locales de impacto |
| **NESGESFinance Ecosystem S.A.S. LLC** | Nuevo México, EE. UU. · File #3168825 · EIN 0008086872 | Propiedad intelectual, infraestructura tecnológica, cumplimiento y expansión internacional |
| **NESGESFinanceTrust** | Pendiente de formalización / jurisdicción por definir | Capa patrimonial o fiduciaria propuesta para continuidad, reservas y administración separada |

Cada proyecto debe operar con **SPV, activo subyacente, expediente, reglamento de emisión, custodia, gobernanza y trazabilidad propios**.

---

## Arquitectura de activos digitales

- **NGF•BTC•AM**: Rune de utilidad sobre Bitcoin L1 con supply fijo, divisibilidad 0 y política no inflacionaria. Su estado debe reconciliarse por grafo UTXO, outpoints y Runestones; no debe modelarse como balance abstracto tipo ERC-20.  
- **Ordinals de proyecto**: series independientes por proyecto con hashes documentales, whitelist y marco jurídico específico. El protocolo Ordinals no determina por sí mismo si un activo es valor, utilidad, certificado o registro; la clasificación depende de la documentación, derechos asociados y jurisdicción de cada serie.  
- **Stable Sats**: capa complementaria propuesta para representaciones vinculadas a fiduciarias o commodities, sujeta a reservas y documentación verificables.

### Aclaraciones técnicas derivadas de auditoría

- **Bitcoin como fuente de verdad:** el estado on-chain debe derivarse de Bitcoin L1; cualquier ledger interno debe reconciliarse contra transacciones, UTXO, Runes y evidencias verificables.
- **Runes:** NGF•BTC•AM se documenta como Rune nativo sobre Bitcoin. Cualquier balance operativo debe provenir de indexación determinista de Runestones y outpoints.
- **Ordinals:** se usan como registros, inscripciones o evidencias de proyecto cuando exista documentación específica. No convierten automáticamente un instrumento en security token ni en utility token.
- **Taproot Assets:** es un protocolo separado basado en Taproot, proofs y `tapd`. Este repositorio no declara un wrapping 1:1 de NGF•BTC•AM hacia Taproot Assets.
- **Lightning:** encaja como capa de pagos, liquidez o experiencia operativa. No altera el estado L1 de NGF•BTC•AM salvo que exista un mecanismo de reconciliación explícito.
- **Bitcoin Core / mempool:** cualquier indexador futuro debe declarar la versión exacta de Bitcoin Core y sus supuestos sobre mempool, RBF, package relay, reorgs y notificaciones de bloque.

---

## Referencia on-chain declarada

| Campo | Valor |
|---|---|
| **Bloque de etching** | 923.867 |
| **Fecha de etching** | 16 de noviembre de 2025 · 10:24:23 UTC |
| **TXID** | `4c0b2416f3dd122025f89a62d7ff265fcee8d00e0fabd874669617cf85437c82` |
| **Fuentes de verificación** | UniSat, Mempool.space y Ord.io |

La raíz de confianza para resolver discrepancias documentales debe ser el TXID, el bloque confirmado y la salida de un indexador Rune determinista. El PDF, HTML o cualquier transcripción documental no deben sustituir al archivo fuente, objeto Git, build reproducible ni verificación on-chain.

---

## Matriz de evidencia y auditoría génesis

Este repositorio incorpora una **Evidence Matrix** en `ngf-asset.json` para evitar que una afirmación declarativa sea tratada como evidencia productiva. Los estados admitidos son:

| Estado | Significado |
|---|---|
| `VERIFIED_ONCHAIN` | Comprobado directamente en Bitcoin u otra fuente on-chain declarada |
| `VERIFIED_SOURCE` | Comprobado contra archivo fuente u objeto Git canónico |
| `VERIFIED_BUILD` | Comprobado mediante compilación o validación reproducible |
| `VERIFIED_RUNTIME` | Probado en ejecución o entorno de integración |
| `DOCUMENTED` | Documentado en materiales del repositorio, sin verificación independiente aquí |
| `DECLARED` | Declarado por metadata o documentos institucionales |
| `SIMULATED` | Sustentado sólo por simulación o fixture |
| `UNVERIFIED` | Pendiente de evidencia o verificación externa |
| `CONTRADICTED` | Contradicho por evidencia más fuerte |

El **NGF Genesis Audit Record** clasifica los datos actuales de TXID, bloque, Rune ID, supply, divisibilidad y mint/burn como información documentada hasta que se reconstruyan mediante Bitcoin Core y un indexador Rune. La custodia 3/5 se mantiene como `UNVERIFIED` porque este repositorio no contiene script, xpubs, atestaciones de firmantes ni ceremonia PSBT verificable.

La FASE II sobre `blocks.ts`, `$updateBlocks()` y hallazgos BLK-001 a BLK-015 no puede corregirse en este repositorio porque el código del indexador Mempool no está presente aquí. Esa auditoría requiere el repositorio `NESGESFinance.mempool.space` o el archivo fuente exacto.

---

## NGF State Machine y Reconciliation Engine

El siguiente paso técnico implementado en la metadata es un modelo formal para reconstruir el estado de NGF•BTC•AM desde Bitcoin L1:

```text
GENESIS_DECLARED
  → ETCHING_VERIFIED
  → RUNESTONE_DECODED
  → PREMINE_RECONSTRUCTED
  → UTXO_DISTRIBUTED
  → RECONCILED
```

Este modelo no afirma que la verificación on-chain ya esté completa. Define los estados, transiciones e invariantes mínimos que debe cumplir un indexador antes de que Exchange, custodia, gobernanza o RWA dependan de balances NGF.

Invariantes principales:

- Bitcoin L1 es la fuente de verdad del estado NGF.
- El balance Rune pertenece a outpoints; una vista por dirección debe derivarse de UTXOs.
- Los valores desconocidos deben mantenerse como `null` o `UNVERIFIED`, nunca como cero.
- Cada afirmación `VERIFIED_ONCHAIN` debe incluir red y evidencia suficiente de transacción o bloque.
- Todo ledger interno debe reconciliarse contra evidencia Bitcoin/Rune antes de uso operativo.

El campo `ngf_reconciliation_engine` de `ngf-asset.json` define entradas, salidas, verificaciones mínimas y no-objetivos. La verificación externa del TXID queda pendiente hasta ejecutarla contra Bitcoin Core, ord/Runes indexer o una fuente indexada confiable.

---

## Validación reproducible

El workflow `.github/workflows/validate-schema.yml` valida dos niveles:

1. **Estructura JSON:** `ngf-asset.json` debe cumplir `ngf-asset-schema.json`.
2. **Semántica mínima NGF:** los estados de evidencia deben coincidir con el estándar, la matriz no puede usar estados inválidos, las transiciones del state machine deben apuntar a estados definidos, las afirmaciones `VERIFIED_ONCHAIN` deben incluir evidencia mínima y el nombre visible debe conservar `NGF•BTC•AM`.

La validación semántica también emite una advertencia si la suma declarada de allocations no coincide exactamente con el supply, pero no la convierte en prueba on-chain. Esa diferencia debe resolverse mediante reconciliación Bitcoin/Rune antes de usar balances operativos.

---

## Trazabilidad arquitectónica v3.1

El nuevo reporte público `NESGESFinance/Documentacion/reporte-arquitectura-nesgesfinance-app.pdf` se incorpora como **fuente documental externa** para la arquitectura objetivo de NESGESFinance.app. Sus afirmaciones no se promueven automáticamente a producción verificada: cada una debe mapearse a código fuente, build, runtime, despliegue o evidencia on-chain antes de cambiar su estado.

`ngf-asset.json` ahora incluye `architectural_claims_traceability`, una matriz específica para claims de frontend, backend Rust/Axum, indexador Runes, Bitcoin Core, PSBT marketplace, token gating, KYC/AML, capa de datos, estructura legal y control documental. Esta matriz mantiene como `DOCUMENTED` o `DECLARED` lo que proviene del PDF y exige evidencia adicional antes de usar estados como `VERIFIED_SOURCE`, `VERIFIED_BUILD`, `VERIFIED_RUNTIME` o `VERIFIED_ONCHAIN`.

Advertencias activas:

- La versión de Bitcoin Core declarada en el PDF debe revisarse frente a la política de version pinning y supuestos de mempool/reorg/RBF.
- La estructura jurídica declarada debe reconciliar diferencias jurisdiccionales entre documentos.
- Cualquier `RuneBalance` operativo debe tratarse como caché derivada de Bitcoin L1, no como fuente de verdad.
- Todo documento marcado como confidencial y publicado públicamente requiere revisión explícita de clasificación documental.

---

## Tokenómica oficial v5.0

| Categoría | % | NGF | Propósito |
|---|---|---|---|
| Reserva estratégica y liquidez | 30% | 1.779.000.000 | Estabilidad operativa y liquidez |
| Proyectos productivos | 25% | 1.482.500.000 | Desarrollo de proyectos tokenizados |
| Sociales y ambientales | 15% | 889.500.000 | Impacto BIC |
| Alianzas y gobernanza | 10% | 593.000.000 | Partnerships e incentivos |
| Tesorería | 10% | 593.000.000 | Operaciones, desarrollo y costos legales |
| Comunidad y staking | 5% | 296.500.000 | Incentivos comunitarios |
| Equipo y asesores | 4% | 237.200.000 | Compensación con vesting |
| Operativo inmediato | 1% | 59.300.000 | Gastos de lanzamiento |

**Distribución declarada:** 100%  
**Vesting declarado:** cliff de 6 meses y liberación lineal posterior durante 12–18 meses  
**Custodia declarada:** diseño multifirma 3/5 coordinado mediante PSBT, rotación semestral y bitácora pública. Este repositorio no contiene evidencia criptográfica suficiente para certificar una custodia productiva.

---

## Proceso de proyecto y participación

- **F0 · Solicitud:** propiedad, avalúo, estados, permisos y memoria técnica  
- **F1 · Due diligence:** verificación legal, financiera y técnica  
- **F2 · SPV y Reglamento:** serie, distribución, calendario y gobernanza  
- **F3 · Cumplimiento:** estructuración bajo el marco aplicable y whitelist  
- **F4 · Emisión L1:** Ordinals, anclaje, multisig y oráculo  
- **F5–F6 · Aprobación y operación:** launchpad, snapshots, reportes y distribuciones

La participación exige **KYC/AML**, verificación de origen de fondos, dirección Bitcoin habilitada y revisión documental de cada serie. Las evidencias de cumplimiento deben mantenerse fuera de datos sensibles públicos y sólo anclar compromisos criptográficos mínimos cuando sea necesario. Todo rendimiento proyectado debe tratarse como **objetivo y no como garantía**.

---

## Motor económico paramétrico

`Ff = (Iₙ × (1 − β)) × p`

- **Iₙ**: ingresos netos auditables  
- **β**: reinversión o reserva  
- **p**: porcentaje contractual de cada serie

---

## Portafolio de despliegue declarado

- Agrícolas  
- Pecuarios y acuacultura  
- Industriales y manufactura  
- Energía e inmobiliario  
- Servicios y turismo  
- Sociales y humanitarios

---

## Transparencia, seguridad y trazabilidad

- Bitcoin L1, Runes, Ordinals, Lightning Network prevista y Taproot Assets como capas separadas  
- Custodia multifirma, PSBT y hardware wallets como arquitectura declarada pendiente de evidencia productiva verificable  
- Hashes SHA-256 o compromisos criptográficos mínimos anclados en Bitcoin cuando sean necesarios  
- Bitácora de custodia, TXID de distribuciones y metadata pública  
- Separación entre explorador público y datos sensibles de cumplimiento

La conformidad regulatoria no debe tratarse como insignia estática. Debe respaldarse mediante expedientes versionados con jurisdicción, fecha de evaluación, base legal, evidencia, responsable y vencimiento o fecha de revisión.

---

## Referencias oficiales

- Frontend institucional: [NESGESFinanceTrust/frontend](https://github.com/NESGESFinance/NESGESFinanceTrust/tree/main/frontend)
- Página institucional: [frontend/institucional.html](https://github.com/NESGESFinance/NESGESFinanceTrust/blob/main/frontend/institucional.html)
- Página principal: [frontend/index.html](https://github.com/NESGESFinance/NESGESFinanceTrust/blob/main/frontend/index.html)
- Whitepaper PDF: [NESGESFinance Ecosystem Mini Whitepaper Institucional 2026](https://github.com/NESGESFinance/NESGESFinanceTrust/blob/main/NESGESFinance%20Ecosystem%20Mini%20Whitepaper%20Institucional%202026%20(2).pdf)
- Sitio público: [nesgesfinance.org](https://nesgesfinance.org/)

---

## Archivos del repositorio

| Archivo | Descripción |
|---|---|
| `ngf-asset.json` | Metadata oficial del activo NGF•BTC•AM |
| `ngf-asset-schema.json` | Esquema JSON para validación |
| `.github/workflows/validate-schema.yml` | GitHub Actions workflow that verifies required files, schema validation and NGF semantic metadata checks |

---

## Licencia y aviso

© **NESGESFinance Ecosystem S.A.S. BIC. & LLC.**  
Todos los derechos reservados 2025–2026.

Uso permitido únicamente dentro de la arquitectura técnica, institucional y documental de NESGESFinance.
