# Auditoría integral — Tesis «Factores asociados al desenlace clínico en pacientes pediátricos con daño renal por Loxoscelismo visceral en un hospital de Lima, Perú, 2014-2024»

- **Archivo auditado:** `Tesis_2.docx` (versión final, 2026)
- **Protocolo aplicado:** `revisor-tesis-cohorte` (STROBE para cohortes + auditoría bioestadística + PubMed/Vancouver)
- **Fecha de auditoría:** 20/11/2026
- **Regla de preservación de datos:** no se ha modificado ningún valor numérico del autor. Las inconsistencias se reportan para su decisión.
- **Recursos no disponibles:** `/bibliografia` y `/normativa_y_guias` no existen en el repositorio. No se pudo contrastar el reglamento de grados y títulos de la Facultad ni la constancia del CIEI.

---

## BLOQUE 1. Hallazgos críticos (Metodología STROBE, Bioestadística y Precisión Clínica)

Ordenados de mayor a menor riesgo ante el jurado.

### 1.1 [CRÍTICO] La Figura 2 contradice el texto sobre cuál fue el único caso favorable
- **Texto (3.3, 4.4, Recomendación 1):** el único caso favorable es el **Caso 4 (región pectoral derecha)**. El Caso 6 (codo izquierdo) figura como desfavorable.
- **Figura 2:** el **Caso 6 (codo izquierdo)** aparece en verde (favorable) y el Caso 4 (pectoral derecho) en rojo (desfavorable).
- **Impacto:** toda la sección 4.4 de la Discusión (la hipótesis de la «retención» del veneno en el tejido pectoral) y la Recomendación 1 dependen de que el caso favorable sea el pectoral. Si la figura es la correcta, ese razonamiento se cae.
- **Solución:** verificar contra la base de datos cuál fue el caso favorable y corregir la figura o el texto. Aun con el dato correcto, eliminar la inferencia fisiopatológica sobre la topografía: es n = 1, la hipótesis farmacocinética no tiene ninguna cita que la respalde y el diseño no permite evaluarla.

### 1.2 [CRÍTICO] Con un solo caso favorable, ninguna prueba podía alcanzar significancia
- Con 6 casos desfavorables y 1 favorable, el **p mínimo alcanzable** es:
  - **0.143** con la prueba exacta de Fisher (recalculado: 1/7).
  - **0.286** con Mann-Whitney exacta. Los únicos p posibles son 0.286, 0.571, 0.857 y 1.000.
- La H3 y la H4 eran, por lo tanto, **matemáticamente no contrastables**. Atribuir los resultados a un «error tipo II» por baja potencia (4.3, 4.5, Conclusión 4, Recomendación 5) es conceptualmente inexacto: no fue falta de potencia, sino la imposibilidad estructural de obtener p < 0.05.
- Todas las «razones de prevalencia» comparan grupos que dependen de las covariables de **un único paciente**.
- **Solución:**
  - Reformular el alcance del estudio como **descriptivo** (cohorte retrospectiva descriptiva o serie de casos).
  - Reportar las pruebas inferenciales solo como exploratorias, o eliminarlas.
  - Declarar explícitamente en Métodos y Limitaciones el p mínimo alcanzable.
  - Ajustar el objetivo general y las hipótesis: el jurado preguntará cómo se puede «determinar factores de riesgo» con un solo evento de comparación.

### 1.3 [CRÍTICO] El OE4 y la HE4 piden un análisis «ajustado/independiente» que no se realizó
- **OE4, PE4 y HE4** piden la asociación **ajustada/independiente**. Solo se ajustaron modelos **univariables**: una covariable por modelo, según el pie de la Tabla 2.
- La corrección de Benjamini-Hochberg (FDR) **no es un ajuste por confusión**: controla comparaciones múltiples. Sin embargo, el texto la presenta así:
  - Resumen: «significancia estadística independiente tras el ajuste por FDR».
  - Sección 3.6: «tras el ajuste multivariable por FDR».
  - Sección 4.5.
  - Conclusión 1: «en el análisis multivariable».
  - Conclusión 5: «asociación independiente».
- El OE4 se definía sobre «factores con significancia bivariada»; como ninguno la tuvo, el objetivo quedó sin candidatos.
- **Solución:**
  - Reformular el OE4 como «estimar la magnitud de asociación cruda (no ajustada)».
  - Reemplazar «ajuste multivariable/independiente» por «corrección por comparaciones múltiples (FDR)» en todo el documento.
  - Declarar el OE4 como no alcanzable en su formulación original.

### 1.4 [CRÍTICO] Inconsistencia interna en la Tabla 2: los p y los IC 95 % provienen de varianzas distintas
Recalculado a partir de las tablas 2×2 reconstruidas con los datos de la Tabla 1:

| Variable | RP | IC 95 % reportado | p reportado | IC con varianza del modelo | IC robusto HC3 (recalculado) | p HC3 (recalculado) |
|---|---|---|---|---|---|---|
| Compromiso hemodinámico / anemia severa / coagulación / sexo masculino (4/6 vs 1/1) | 0.80 | 0.15–4.37 | 0.425 | **0.15–4.37** (p = 0.797) | **0.46–1.38** | **0.425** |
| Lima (incluye Callao) vs No Lima | 1.50 | 0.27–8.19 | 0.508 | **0.27–8.19** (p = 0.640) | **0.45–4.98** | **0.508** |

- Los **p** coinciden con la varianza robusta HC3. Los **IC 95 %** coinciden con la varianza **del modelo de Poisson sin corrección robusta**. Tabla 2, Figura 3, texto y Métodos declaran HC3 para todo.
- El mismo patrón aparece en las variables continuas. Por ejemplo, hemoglobina: RP 0.95 con IC 0.14–6.33 no es compatible con p = 0.858 bajo una misma varianza.
- **Solución:** reestimar todos los IC con HC3 (por ejemplo, `sandwich::vcovHC(type = "HC3")` + `coeftest`/`coefci` en R) y actualizar la Tabla 2 y la Figura 3. **Decisión del autor:** los valores recalculados aquí sirven de referencia y no sustituyen la reestimación con la base original.
- **Nota:** «Lima vs No Lima» solo reproduce la RP = 1.50 si se clasifica el **Callao como Lima**. Con «Lima Metropolitana» sola, la RP sería 1.20. Definirlo en Métodos, porque la ficha (Anexo 1) registra Callao por separado.

### 1.5 [CRÍTICO] El desenlace compuesto no está desagregado ni operacionalizado
- En ninguna parte se informa **cuántos de los 6 desenlaces desfavorables fueron muertes**, cuántos dependencia de diálisis al alta y cuántos disfunción renal residual. La mortalidad es el dato que el jurado pedirá primero. La ficha (Anexo 1, sección VI) sí recoge las cinco categorías.
- La definición de «desenlace desfavorable» **cambia entre secciones**:
  - 2.1.3: incluye «complicaciones intrahospitalarias graves», con la referencia 9 (una revisión) como fuente de la definición operacional del estudio.
  - 2.3.4: mortalidad, dependencia de diálisis o disfunción renal residual.
  - Resumen: «daño renal residual severo».
  - 3.4: «disfunción renal residual que demandó seguimiento nefrológico prolongado».
- «Disfunción renal residual» no tiene criterio objetivo: no se indica umbral de creatinina o TFGe (Schwartz), relación con la creatinina basal ni momento de medición. Tampoco se definen la ventana de seguimiento ni la fecha de corte.
- **Solución:**
  - Agregar una tabla de desagregación del desenlace (n por componente).
  - Fijar una única definición operacional con criterio objetivo, por ejemplo TFGe < X mL/min/1.73 m² al alta o KDIGO AKD. El criterio de umbral es del autor y debe citar su fuente.
  - Retirar la referencia 9 como fuente de la definición propia.

### 1.6 [CRÍTICO] La prueba piloto es incompatible con el flujo de participantes, y el alfa de Cronbach no corresponde
- El flujo (Figura 1 y sección 3.1) parte de **30 historias T63.3**, de las cuales **7 no fueron recuperables**. Sin embargo:
  - La sección 2.3.6 y los Anexos 4 y 5 reportan una prueba piloto «sobre 30 registros hospitalarios», con **datos clínicos completos de 30 registros**.
  - **No es posible** tener datos de 30 registros si 7 historias no existían en archivo. Además, la prueba piloto usó la propia población de estudio.
- El **alfa de Cronbach** mide consistencia interna de una escala de ítems que miden un mismo constructo. No es aplicable a una ficha de extracción de variables clínicas independientes (fiebre, ictericia, plaquetas…). Un α = 0.934 aquí solo refleja que los casos graves tienen muchas variables positivas a la vez.
- **Solución:**
  - Aclarar el origen de los 30 registros piloto.
  - Si no fueron historias distintas de la población de estudio, eliminar la afirmación.
  - Para la calidad de extracción, reportar la **concordancia inter-evaluador**: kappa de Cohen para variables categóricas y CCI para continuas, sobre una doble extracción.
  - Retirar el alfa de Cronbach.

### 1.7 [ALTO] Temporalidad: las variables «basales» no son basales
- La Tabla 1 y el título de la sección 3.2 dicen «basales», pero las variables son la **hemoglobina nadir**, la **creatinina pico** y el **ingreso a UCIP**. Las tres se miden o se producen *durante* la evolución, después del tiempo cero.
- La hemoglobinuria se describe «al ingreso» en 3.2 y 4.3, pero «durante su internamiento» en 3.4.
- No se define el **tiempo cero** de la cohorte: ¿ingreso al INSN?, ¿inicio de diálisis?
- El ingreso a UCIP es un **marcador o mediador de la gravedad** y no un factor de exposición previo. Puede ser parte del propio camino hacia la muerte: los pacientes que fallecen suelen morir en UCI. Presentarlo como «factor de riesgo» o «señal de alarma temprana» (Resumen, Conclusiones) es circular.
- El análisis no es de tiempo al evento, así que el sesgo de tiempo inmortal no aplica en sentido estricto. Aun así, la ambigüedad temporal debe declararse.
- **Solución:**
  - Definir el tiempo cero.
  - Clasificar cada variable como basal (al ingreso) o evolutiva.
  - Renombrar la Tabla 1, que hoy dice «basales».
  - Discutir la UCIP como marcador de gravedad, no como predictor.

### 1.8 [ALTO] «100 % KDIGO estadio 3» es tautológico, no un hallazgo
- En la definición KDIGO 2012, el **inicio de terapia de reemplazo renal** es por sí mismo criterio de estadio 3. Verifíquese en el texto original de la guía; ver referencia 39 en el Bloque 4.
- Como todos los pacientes fueron dializados por criterio de inclusión, el 100 % en estadio 3 se debe a la selección, no a un resultado. Las secciones 4.2 y 4.5 lo interpretan como hallazgo («confirma…», «lejos de representar una debilidad…»).
- **Solución:** declararlo como consecuencia del criterio de inclusión, retirar KDIGO como variable independiente de la Tabla 1 y la operacionalización, y acortar la sección 4.2.

### 1.9 [ALTO] La operacionalización de variables está incompleta y hay reporte selectivo
- La Tabla 1 de operacionalización agrupa **22 indicadores en una sola fila**, sin definición operacional, punto de corte, escala ni fuente. Ese es el núcleo del ítem 7 de STROBE.
- No se definen:
  - «Anemia severa»: con hemoglobina en el rango 6.10–7.50 g/dL, la proporción de anemia severa depende enteramente del umbral, que debe declararse con su fuente (por ejemplo, umbrales OMS por grupo etario).
  - «Necrosis cutánea extensa».
  - «Compromiso hemodinámico».
  - «Alteraciones de la coagulación».
  - «Hemoglobinuria macroscópica»: no se distingue de la hematuria ni de la mioglobinuria sin tira reactiva y sedimento.
  - «Loxoscelismo visceral»: el criterio diagnóstico es solo el «consignado en la HC».
  - El rango de edad «pediátrico».
- Hay variables operacionalizadas y recogidas en la ficha que **no se reportan**: fiebre, ictericia, oliguria/anuria, plaquetas/trombocitopenia, leucocitos, hematuria, creatinina basal y al ingreso, tiempos de enfermedad, referencia y hasta diálisis, duración de la diálisis, transfusión, antiveneno, corticoides, soporte vasoactivo y estancia hospitalaria. Esto contradice los ítems 12 y 13 de STROBE y abre la sospecha de reporte selectivo.
- La modalidad de diálisis (hemodiálisis, diálisis peritoneal o TRRC) no se informa, aunque es el eje de la población.
- **Solución:** reconstruir la operacionalización con una fila por variable y reportar todas las variables recogidas. Las que tengan datos faltantes se informan con su n de faltantes.

### 1.10 [ALTO] Sesgo de selección en la captura de casos
- La captura dependió **solo del código CIE-10 T63.3** (efecto tóxico de veneno de araña) en los egresos. Se identificaron **30 casos en 11 años** (2014–2024).
- La propia tesis cita a Juárez et al. (ref. 8) con **74 pacientes en la misma institución en 2010–2018**. Esa diferencia sugiere subcaptura por codificación.
- Las 7 historias no recuperables (23 %) podrían incluir pacientes dializados. No se comparan sus datos administrativos disponibles.
- **Solución:**
  - Ampliar la búsqueda: códigos de causa externa (X21, contacto con arañas venenosas), N17 (insuficiencia renal aguda) con procedimientos de diálisis, registros de nefrología y UCIP.
  - Declarar el sesgo en Limitaciones.
  - Comparar las historias perdidas con las incluidas en las variables administrativas disponibles (ítem 13 de STROBE).

### 1.11 [ALTO] Bioética: falta la constancia de aprobación
- No se declara el **nombre del comité, el número o código de aprobación ni la fecha**. Solo se dice «aprobación del Comité de Ética» y «aprobación institucional respectiva».
- El Anexo 3 es una **solicitud** de dispensa de consentimiento, sin firma, con campos en blanco y fechada el **27 de agosto de 2026**. No acredita que la dispensa haya sido **otorgada**, ni que su fecha sea anterior a la recolección de datos.
- No consta la autorización de la sede de ejecución (INSN).
- **Confidencialidad:** con n = 7 en una enfermedad rara, describir caso por caso la edad, el sexo, la procedencia (por ejemplo, Callao) y el sitio exacto de la mordedura (Figura 2) aumenta el riesgo de reidentificación.
- Además, la portada anonimiza («un hospital de Lima») pero el cuerpo del texto nombra al INSN.
- **Solución:**
  - Insertar el código y la fecha de aprobación del CIEI y la resolución de dispensa.
  - Adjuntar las constancias.
  - Definir si la sede se anonimiza o no y aplicar el criterio de forma uniforme.
  - Evitar combinaciones de atributos que identifiquen a un caso.
  - No fue posible verificar el formato exigido por el reglamento de la Facultad porque no se aportó `/normativa_y_guias`.

### 1.12 [ALTO] Conclusiones y recomendaciones exceden los datos
- **Resumen y Conclusiones:** proponen la hemoglobinuria y la UCIP como «señales de alarma clínica temprana» a partir de la presencia/ausencia en un único paciente favorable.
- **Recomendación 1:** propone «fluidoterapia enérgica» y «alcalinizar la orina», y extiende la alerta a «pliegues inguinales». No se evaluó la fluidoterapia, la alcalinización ni ninguna mordedura inguinal.
- **Recomendación 2:** propone TRRC y recambio plasmático precoz; el estudio no evaluó intervenciones.
- **Sección 4.1:** concluye que la «hidratación enérgica inicial» es la ventana de oportunidad; no hay dato que lo sustente.
- **Solución:** limitar las conclusiones a lo descriptivo y redactar las recomendaciones como hipótesis para estudios futuros, con las citas que correspondan.

### 1.13 [MEDIO] Diseño y medida de asociación
- Para una cohorte con incidencia acumulada, la medida correcta es el **riesgo relativo (RR) estimado por Poisson con varianza robusta**, no la «razón de prevalencia».
- La elección de Poisson robusta en lugar de regresión logística es **adecuada**, dado que el desenlace tiene una frecuencia de 85.7 % (un OR sobreestimaría el RR).
- **Necrosis cutánea:** la RP puntual sí es estimable (0.83: 5/6 frente a 1/1). Lo que no es calculable es la varianza HC3, por el apalancamiento h = 1 del único paciente no expuesto. Reportar la RP con esa salvedad.
- **Terminología de separación:** el pie de la Tabla 2 dice «separación cuasi-perfecta» y el texto dice «separación completa». Unificar a «separación completa (celda cero)».
- **Edad, p = 0.449:** ese valor no corresponde a la distribución exacta de Mann-Whitney con 1 frente a 6 observaciones. Indicar si se usó aproximación asintótica por empates; las demás comparaciones sí coinciden con p exactos.
- **Solución:** sustituir «RP» por «RR» en todo el documento y aplicar las aclaraciones anteriores.

### 1.14 [MEDIO] Citación: numeración, pertinencia y ausencia de citas en la Discusión
- **La Discusión no tiene ninguna cita numerada**, a pesar de mencionar a 14 autores (Severino, Gremski, Zarei, Cleto-Yamane, Juárez, Hoste, Susantitaphong, Wille, Pinto, Silva-Magalhães, Neyra-León, Gonzales-Flores, Mani, Suárez-Ospino).
- **Numeración no correlativa:** las referencias 38, 43 y 44 se citan antes que la 17.
- **Un mismo número para dos fuentes distintas:**
  - (34) es Arán-Sekul (proteoma de *Sicarius*), pero se usa en el texto para Gonzales-Flores (caso pediátrico, que es la 25).
  - (36) es Malaque, pero se usa siete veces para Neyra-León (que es la 24).
  - (35) es Suárez-Ospino, pero se usa para factores intradomiciliarios.
- **Antecedentes repetidos:** Mani (11) y Valenzuela (13) se describen dos veces.
- **Antecedente no pertinente:** Sencia (16), sobre calidad de vida en ERC de adultos, no aporta al tema.
- **Fuentes inadecuadas para lo que se les atribuye** (detalle en el Bloque 4):
  - Reportes de caso y revisiones usados para cifras epidemiológicas, como Luna-Muñoz (29) para la estacionalidad nacional.
  - Selewski (42), un estudio de sobrecarga hídrica en TRRC, citado para mecanismos de lesión por envenenamiento y ventajas de la diálisis peritoneal.

### 1.15 [MEDIO] Ítems STROBE no cumplidos o incompletos (resumen)
- **Título (1a):** no menciona el diseño ni la población dializada. Además difiere entre la portada y el Anexo 1.
- **Contexto (5):** falta la ventana de seguimiento y las fechas de recolección.
- **Variables (7):** ver hallazgo 1.9.
- **Fuentes de datos (8):** no se explica cómo se identificó la hemoglobinuria en la historia clínica.
- **Sesgos (9):** el sesgo de información y registro está mencionado; el de selección por codificación no (ver 1.10).
- **Tamaño (10):** censal; debe justificarse la imposibilidad de inferencia (ver 1.2).
- **Datos faltantes (12c, 14b):** no se informan por variable.
- **Desenlace (15):** no está desagregado (ver 1.5).
- **Otros análisis (17):** no aplica.
- **Generalización (21):** abordada de forma adecuada en 4.6.

---

## BLOQUE 2. Auditoría de coherencia numérica (Resumen vs. Texto vs. Tablas vs. Figuras)

| N.° | Dato | Resumen | Texto | Tabla / Figura | Verificación | Estado |
|---|---|---|---|---|---|---|
| 1 | Flujo 30 → 23 → 7 | — | 30 − 7 = 23; 23 − 16 = 7 | Figura 1: igual | Aritmética correcta | ✅ Coherente |
| 2 | Prueba piloto «30 registros» | — | 2.3.6: 30 registros | Anexos 4–5: 30 registros con datos | 7 de los 30 no eran recuperables | ❌ **Inconsistente** (ver 1.6) |
| 3 | Desenlace desfavorable 6/7 | 85.7 %; IC 42.1–99.6 % | Igual | Tabla 1: igual | Clopper-Pearson recalculado: 42.1–99.6 % | ✅ Coherente |
| 4 | Sexo masculino | 71.4 % | 5 (71.4 %); 4/6 (66.7 %) vs 1/1 | Tabla 1: igual | 4 + 1 = 5 | ✅ |
| 5 | Procedencia | — | 3 / 2 / 1 / 1 | Tabla 1: igual | Suma de % = 100.1 (redondeo) | ⚠️ Añadir nota de redondeo |
| 6 | Necrosis cutánea | 85.7 % | 6 (85.7 %); 5/6 vs 1/1 | Tabla 1: igual | 5 + 1 = 6 | ✅ |
| 7 | UCIP y hemoglobinuria | 85.7 %; 100 % vs 0 % | Igual | Tabla 1: igual; Fisher p = 0.143 | Fisher recalculado: 0.143 | ✅ |
| 8 | Hemodinámico, anemia, coagulación | — | 5 (71.4 %); 4/6 vs 1/1 | Tabla 1: igual; p = 1.000 | Fisher recalculado: 1.000 | ✅ |
| 9 | Hemoglobina | — | «nadir» 6.90 [6.10–7.50] | Tabla 1: «Hemoglobina» (sin «nadir») | Valores iguales; etiqueta distinta | ⚠️ Unificar etiqueta |
| 10 | Creatinina | — | «pico» 5.20 [4.00–6.20] | Tabla 1: «Creatinina» | Valores iguales; etiqueta distinta | ⚠️ Unificar etiqueta |
| 11 | Mann-Whitney (n 1 vs 6) | — | p = 1.000; 0.571; 0.286; 0.857; 0.857 | Tabla 1: igual | Coinciden con p exactos posibles | ✅ |
| 12 | Edad p = 0.449 | — | Igual | Tabla 1: igual | No es un p exacto posible (0.286 / 0.571 / 0.857 / 1.000) | ⚠️ Declarar el método |
| 13 | Caso favorable (topografía) | — | **Caso 4 (pectoral)** | Figura 2: **Caso 6 (codo)** en verde | Contradicción | ❌ **Crítico** (ver 1.1) |
| 14 | RP 0.80 (4 variables binarias) | — | IC 0.15–4.37; p = 0.425 | Tabla 2 y Figura 3: igual | IC del modelo, p de HC3; IC HC3 = 0.46–1.38 | ❌ **Inconsistente** (ver 1.4) |
| 15 | RP Lima vs No Lima | — | 1.50 (0.27–8.19); p = 0.508 | Tabla 2 y Figura 3: igual | IC del modelo, p de HC3; IC HC3 = 0.45–4.98 | ❌ **Inconsistente** |
| 16 | p ajustados (BH) | — | 0.704 / 0.736 / 0.762 / 0.858 | Tabla 2: igual | Recalculados con m = 11: coinciden | ✅ |
| 17 | Tipo de separación | «separación completa» | «separación completa» | Tabla 2: «cuasi-perfecta» | Términos distintos | ⚠️ Unificar |
| 18 | % de compromiso hemodinámico en pacientes de UCIP | — | 4.3: «inestabilidad hemodinámica (71.4 %)» en los «niños admitidos a UCIP» | — | En UCIP (n = 6) es 4/6 = **66.7 %**; 71.4 % es el total de la cohorte | ❌ Corregir |
| 19 | Transfusión | — | 4.3: «anemia… que demandó soporte transfusional (71.4 %)» | No reportada en Resultados ni en tablas | Dato sin respaldo en Resultados | ❌ Retirar o reportar |
| 20 | Tipo de análisis | «ajuste por FDR» | Conclusión 1: «análisis multivariable» | Tabla 2: «univariable» | Contradicción metodológica | ❌ (ver 1.3) |
| 21 | Cabeza y cuello | «Predominaron… (42.9 %)» | 3/7 | Figura 2: 3 casos | 42.9 % no es mayoría (57.1 % en otras zonas) | ⚠️ Cambiar «predominaron» por «fueron frecuentes» |
| 22 | Índice de figuras | — | Figura 2: p. 67; Figura 3: p. 61 | — | El orden de páginas no corresponde | ⚠️ Actualizar el índice |
| 23 | Numeración de tablas | — | «Tabla 1» = operacionalización **y** características | — | Dos tablas con el mismo número | ⚠️ Renumerar |

---

## BLOQUE 3. Correcciones de redacción y estilo académico

| Sección | Fragmento original | Texto corregido propuesto | Motivo |
|---|---|---|---|
| Resumen – Resultados | «Predominaron las mordeduras en cabeza y cuello (42.9%)» | «Las mordeduras se localizaron con mayor frecuencia en cabeza y cuello (42.9 %)» | 42.9 % no es predominio |
| Resumen – Resultados | «ninguna covariable mostró significancia estadística independiente tras el ajuste por FDR» | «ninguna covariable mostró asociación estadísticamente significativa tras la corrección por comparaciones múltiples (FDR)» | FDR no es un ajuste multivariable |
| Resumen – Conclusiones | «La concentración absoluta de hemoglobinuria macroscópica e ingreso a UCIP en los casos tórpidos sugiere su relevancia como señales de alarma clínica temprana» | «La hemoglobinuria macroscópica y el ingreso a UCIP estuvieron presentes en los seis casos con desenlace desfavorable y ausentes en el único caso favorable; dado el tamaño de la serie, este hallazgo es exploratorio» | Evita sobreinterpretar; «tórpido» es coloquial |
| Abstract | «censal cohort» / «rare censal cohort» | «a census of all eligible patients» / «a small census-based cohort» | «Censal» no se usa en inglés científico |
| Todo el documento | «Loxoscelismo» con mayúscula inicial en mitad de oración | «loxoscelismo» | Los nombres de enfermedades son comunes (RAE) |
| Todo el documento | «daño renal agudo» / «injuria renal aguda» / «falla renal aguda» / «insuficiencia renal» | Un solo término, por ejemplo «lesión renal aguda (LRA)», alineado con el DeCS de las palabras clave | Precisión terminológica; «falla» es anglicismo |
| Todo el documento | «estadio III de la clasificación KDIGO» / «KDIGO III» | «estadio 3 de KDIGO» | Nomenclatura de la guía |
| Todo el documento | «razón de prevalencia (RP)» | «riesgo relativo (RR)» | Medida propia de un diseño de cohorte |
| 1.2.1 / 1.3.1 | «factores de riesgo asociados» | «factores asociados» | Coherencia con el título y el diseño |
| 2.1.1 Antecedentes | «Gremski et al. (9) tuvo como objetivo… desarrolló… describió» (igual en todos los antecedentes) | «Gremski et al. (9) tuvieron como objetivo… desarrollaron… describieron» | Concordancia de número con «et al.» |
| 2.1.1 Antecedentes | «Mani et al. (11) tuvo como objetivo…» (segunda descripción) | Eliminar el párrafo duplicado (igual para Valenzuela, 13) | Redundancia |
| 2.2.2 | «Hipótesis especificas» | «Hipótesis específicas» | Tilde |
| 2.3.1 | «ocurrieron previo a la recolección» | «ocurrieron antes de la recolección» | «Previo a» como locución adverbial es desaconsejado |
| 2.3.2 | «que… hayan desarrollado daño renal y hayan sido sometidos… se evaluarán los factores» | «que… habían desarrollado daño renal y habían sido sometidos… se evaluaron los factores» | Tiempo verbal pasado en una tesis final |
| 2.3.3 | «La muestra fue de tipo censal e incluyó…» | «No se realizó muestreo; se incluyó a la totalidad de la población elegible (estudio censal, n = 7)» | Precisión: un censo no es una muestra |
| 2.3.6 | «validación de contenido por un juicio de expertos en pediatría, nefrología pediatra y métodologos» | «validación de contenido mediante juicio de expertos en pediatría, nefrología pediátrica y metodología» | Ortografía y concordancia |
| 2.3.8 | «estadística descriptiva e inferencias» | «estadística descriptiva e inferencial» | Término correcto |
| 2.3.8 | «al 95%para» | «al 95 % para» | Espaciado |
| 2.3.8 | «cada factor clínico, laboratoriales y sociodemográfico» | «cada factor clínico, laboratorial y sociodemográfico» | Concordancia |
| 2.3.8 | «carácterística» | «característica» | Tilde |
| 2.3.8 / Matriz | «(HC#)» | «(HC3)» | Errata |
| 3.4 | «El desenlace clínico desfavorable definido operacionalmente por el fallecimiento…, se presentó…» | «El desenlace clínico desfavorable, definido operacionalmente como fallecimiento…, se presentó…» | Puntuación del inciso |
| 3.4 | «coagulopatías de consumo (66.7%, n=4)» | «alteraciones de las pruebas de coagulación (66.7 %, n = 4)» | No se documentaron criterios de CID |
| 3.6 | «tras el ajuste multivariable por FDR» | «tras la corrección por comparaciones múltiples (FDR)» | Error conceptual |
| 4.2 / 4.3 | «Lejos de representar una debilidad analítica…» / «Lejos de constituir un artificio numérico… traduce una contundente realidad biológica» | «Esta homogeneidad deriva del criterio de inclusión…» / «Esta distribución es compatible con… aunque depende de un único caso favorable» | Registro argumentativo excesivo; afirmación no sustentada |
| 4.3 | «configurando un clásico error tipo II» | «el diseño no permitía alcanzar p < 0.05 (p mínimo alcanzable = 0.143)» | Precisión estadística |
| 4.4 | «ingreso de la esfingomielinasa D y las fosfolipasas D» | «ingreso de las fosfolipasas D (esfingomielinasas D)» | La propia tesis define la SMase D como PLD |
| 4.1 / 4.2 / 4.3 | Autores mencionados sin número de cita | Añadir la cita numerada (por ejemplo, «Zarei et al. (2)») | Requisito Vancouver |
| Capítulo II | «(29) (30) (34)» | «(29,30,34)», con los números ya corregidos | Formato Vancouver de citas múltiples |
| Índice / Referencias | «BIBLIOGRÁFICAS» | «REFERENCIAS BIBLIOGRÁFICAS» | Título de sección |
| Figuras y tablas | «Figura-1», «Tabla-1» | «Figura 1», «Tabla 1» | Uniformidad |
| 2.1.2 Indicaciones de TRR | «hiperkalemia» | «hiperpotasemia» | Término preferido en español (DeCS) |
| General | Decimales injustificados: «9.00 años», «158.00 mg/dL» | «9 años», «158 mg/dL» | Precisión acorde a la medición |

<!-- BLOQUES 4 y 5: se completan con la verificación PubMed -->
