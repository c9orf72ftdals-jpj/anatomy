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
- **Discrepancias afirmación–fuente verificadas en PubMed/PMC** con impacto en la sustentación:
  - **Ref. 9 (Gremski):** no contiene la letalidad de «1–3 %» ni el «10–15 %» de formas viscerocutáneas que se le atribuyen (Cap. I y Discusión 4.1). El texto completo indica una frecuencia de la forma sistémica «de ~1 a 27 %» y que «20–25 %» de los pacientes presentan signos sistémicos. Tampoco define ningún «desenlace desfavorable».
  - **Ref. 40 (Susantitaphong):** no reporta «5–30 %» de incidencia de lesión renal aguda en niños. El resumen da **33,7 %** (IC 95 %: 26,9–41,3).
  - **Ref. 3 (Cleto-Yamane):** el rango «10–63 %» es una frase de antecedentes del artículo, no un resultado. Su resultado propio es una mortalidad de **65,2 %** en niños con terapia de reemplazo renal. Es un comparador directo que la Discusión no usa.
  - **Ref. 17 (Wille):** no respalda que «la hemoglobinuria y la inflamación sistémica causen lesión tubular». Atribuye el daño renal a la acción directa de las fosfolipasas D (PLD) y señala la **ausencia** de respuesta inflamatoria en el tejido renal.
  - **Ref. 21 (Martins):** la afirmación sobre «viviendas, escuelas y lugares de trabajo» se refiere a *Phoneutria*, no a *Loxosceles*. Además, la revista, el volumen y los autores citados son erróneos.
  - **Ref. 42 (Selewski):** la cita combina datos de dos publicaciones y no existe en PubMed tal como está escrita. El artículo real (ECMO + TRRC, *Crit Care Med* 2012) no respalda ninguna de las tres afirmaciones para las que se cita.
  - **Ref. 34 (Arán-Sekul):** trata de *Sicarius*. Menciona los efectos de las PLD de *Loxosceles* solo como cita secundaria; debe citarse la fuente primaria.
  - **Ref. 32 (Pinto):** solo estudió queratinocitos; no hay datos en fibroblastos.
  - **Refs. 31 (Lachmayr) y 22 (Antunes):** cada cita mezcla datos de dos publicaciones; la revista, el título y los autores no corresponden.
  - **Ref. 39 (KDIGO):** el resumen de Kellum y Lameire se publicó en *Crit Care* 2013, no en *Kidney Int*.

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

---

## BLOQUE 4. Tabla de Auditoría Bibliográfica

**Cómo se hizo la verificación:**
- Se consultó el conector **PubMed** (NCBI) por DOI, PMID o título exacto. Cuando el artículo estaba en PubMed Central (PMC), se revisó el texto completo.
- Todos los PMID, DOI y metadatos de esta tabla proceden de esas consultas. Ninguno se escribió de memoria.

**Incidencia en la verificación de las referencias 28–30:**
- La verificación automática de este tramo se interrumpió por una restricción de seguridad de la plataforma.
- La ref. 28 quedó verificada solo en parte; las refs. 29 y 30 **no se verificaron**.
- Las tres figuran como `[CITA POR VERIFICAR]` y deben revisarse en una nueva consulta.

| N.° | Afirmación en tesis | PMID / DOI verificado | Estado | Observación |
|---|---|---|---|---|
| 1 | Forma cutáneo-visceral 10–15 %; letalidad 1–3 % | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: revista chilena no indexada en PubMed; revisar en arsmedica.cl]`. Es una revisión a propósito de un caso usada para cifras epidemiológicas; debe citarse una fuente primaria. |
| 2 | 60 estudios, 133 876 niños, mortalidad 18,27 % | PMID 40045255 · doi:10.1186/s12882-025-04033-2 · PMC11883935 | **Corregida en Vancouver** | La afirmación coincide con el resumen. Errores en la cita: autores 2.º y 3.º («Bahadoram», «Moghadasi» no son autores) y número de artículo (es 117, no 57). |
| 3 | Mortalidad 10–63 % en niños con diálisis | PMID 38446208 · doi:10.1007/s00467-024-06305-9 | **Corregida en Vancouver** | Corregir número y páginas: 39(7):2253-62, no 39(6):1881-90. Corregir autores y título («multicentric»). El 10–63 % es una frase de antecedentes del artículo; su resultado propio es una mortalidad de 65,2 %. |
| 4 | 8850 casos y 8 defunciones (2016–2021) | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: nota de prensa MINSA (gob.pe); fuente gris no indexable]` |
| 5 | 539 casos hasta la SE 19-2024 | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: sala situacional CDC-Perú]` |
| 6 | 1280 casos hasta la SE 53-2025 | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: sala situacional CDC-Perú]` |
| 7 | Distritos y departamentos notificantes; Lima entre los principales | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: sala situacional CDC-Perú]`. Tiene el mismo título que la ref. 5 («2006-2024»); conviene diferenciarlas. |
| 8 | INSN, 74 pacientes, 2010–2018, 45,9 % cutáneo-visceral | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: solo existe un enlace a ResearchGate, sin revista ni volumen; confirmar si está publicado]`. Es el único antecedente institucional y debe tener una fuente formal. |
| 9 | Sistémico menos frecuente pero grave; PLD dañan el riñón. También usada para letalidad 1–3 %, 10–15 % y para la definición de desenlace desfavorable | PMID 36668837 · doi:10.3390/toxins15010017 · PMC9864854 | **Discrepancia con fuente original** | El año es 2022, no 2023. Se confirman la gravedad del cuadro sistémico y el daño renal por PLD. **No** contiene 1–3 % ni 10–15 % (dice «~1 a 27 %» y «20–25 %»). **No** contiene la definición de desenlace. Es una revisión narrativa. |
| 10 | Caso adolescente con hemólisis tardía | PMID 37950477 | **Corregida en Vancouver** | Falta el número (11). No tiene resumen, así que la afirmación solo se contrastó con el título y los MeSH. |
| 11 | Varón de 19 años, Hb 3,4 g/dL, hematuria, edema pulmonar, vasculitis | PMID 38333678 · doi:10.1016/j.jdcr.2023.12.014 · PMC10847676 | **Corregida en Vancouver** | Las páginas son 11-17, no 32-35. La afirmación coincide con el texto completo. El antecedente está duplicado en la tesis. |
| 12 | 7 casos, Milán, mar–oct 2022, oxigenoterapia hiperbárica (OHB), marcadores renales | PMID 40710570 · doi:10.3390/metabo15070470 · PMC12298263 | **Corregida en Vancouver** | Faltan los autores (solo dice «et al.»). La afirmación coincide con el resumen. |
| 13 | Mujer de 31 años, urea 125, Cr 1,82, Hb-uria 3+, SLED + hemoadsorción | PMID 39859124 · doi:10.3390/medicina61010143 · PMC11766656 | **Corregida en Vancouver** | Faltan los autores. La afirmación coincide con el texto completo. El antecedente está duplicado en la tesis. |
| 14 | Varón de 19 años, rabdomiólisis, lesión renal aguda (LRA), hemólisis al día 6 | PMID 36410457 · doi:10.1016/j.toxicon.2022.106975 | **Discrepancia con fuente original** + **Corregida en Vancouver** | La revista es *Toxicon*; el texto de la tesis dice «Toxicology Reports». El volumen es 222, no 220. La afirmación coincide con el resumen. |
| 15 | Caso pediátrico de shock y anemia por loxoscelismo | PMID 41475389 · doi:10.1542/pir.2024-006405 | **Corregida en Vancouver** | No tiene resumen. **No se pudo confirmar que el caso sea de loxoscelismo**; hay que revisarlo en la fuente. |
| 16 | Calidad de vida en enfermedad renal crónica (ERC) con diálisis (Cusco) | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: tesis de pregrado, repositorio ALICIA]`. No es pertinente para el tema; se sugiere retirarla. |
| 17 | Las PLD escinden fosfolípidos y causan ectocitosis; la hemoglobinuria y la inflamación causan lesión tubular | PMID 39998087 · doi:10.3390/toxins17020070 · PMC11860474 | **Discrepancia con fuente original** | Los autores 2.º a 4.º son erróneos y el número de artículo no coincide con el DOI. La ectocitosis se confirma. El mecanismo renal que se atribuye **no**: la fuente propone daño directo por PLD sin inflamación renal. |
| 18 | El diagnóstico integra la epidemiología, la clínica y el laboratorio | PMID 39507426 · doi:10.1016/j.toxcx.2024.100211 · PMC11539352 | **Corregida en Vancouver** | El número de artículo es 100211, no 100240. Los autores son erróneos. La afirmación coincide con el texto completo. |
| 19 | Hemólisis directa sin plasma | PMID 39728790 · doi:10.3390/toxins16120532 · PMC11680057 | **Corregida en Vancouver** | El segundo autor es erróneo. La afirmación coincide con el texto completo (estudio in vitro). |
| 20 | Relevancia sanitaria en Perú | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: revista UPCH no indexada en PubMed]`. Es un estudio de conocimientos en pobladores, no epidemiológico. |
| 21 | *Loxosceles* se adapta a viviendas, escuelas y lugares de trabajo | PMID 40290776 · doi:10.1590/1678-9199-JVATITD-2024-0057 · PMC12023759 | **Discrepancia con fuente original** | La revista es *J Venom Anim Toxins Incl Trop Dis* 31:e20240057, no *Front Public Health*. Los autores son erróneos. La frase se refiere a *Phoneutria*; sobre *Loxosceles* la fuente dice que se encuentra «mainly in rural areas». |
| 22 | Especies sudamericanas: *L. laeta*, *L. intermedia*, *L. gaucho* | PMID 36672587 · doi:10.3390/biomedicines11010079 · PMC9856178 | **Corregida en Vancouver** (referencia sustituida) | El título, la revista (*Biomedicines* 11(1)) y los autores son otros. El número «15(1):17» pertenece a Gremski. Es un estudio experimental usado para un dato epidemiológico; se sugiere una fuente primaria. |
| 23 | Distribución mundial; refugio en interiores (Bolivia) | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: revista boliviana no indexada en PubMed]` |
| 24 | Forma víscero-hemolítica tórpida | No en PubMed | **No encontrada** | `[CITA POR VERIFICAR: Rev Méd Panacea no indexada]`. En el texto se cita **siete veces con el número 36**, que es Malaque. |
| 25 | Caso pediátrico confundible con celulitis o edema | PMID 40829576 · doi:10.24875/BMHIM.24000125 | **Corregida en Vancouver** | El título real está en inglés y es distinto. Las páginas son 267-271. En el texto también se cita como (34). Es loxoscelismo **cutáneo** edematoso, no visceral. |
| 26 | Las formas sistémicas evolucionan rápido; caso fatal | PMID 38910721 · doi:10.7759/cureus.60943 · PMC11193545 | **Corregida en Vancouver** | El título real termina en «…With Orbital Compartment Syndrome». Es 16(5):e60943. La afirmación coincide con el texto completo (adulto de 44 años). |
| 27 | España 1997–2020: 1,23 casos por millón; sin muertes por araña | PMID 38598337 · doi:10.1093/jme/tjae045 | **Válida** | Los metadatos coinciden y la afirmación coincide con el resumen. |
| 28 | PLD 69,28 %; Perú: 1071, 582 y 361 accidentes (2019–2021) | PMID 35932519 · doi:10.1016/j.cbd.2022.101017 | **Corregida en Vancouver** (verificación parcial) | Hay errores en los nombres de los autores 5.º y 6.º. El 69,28 % es de los *transcritos de toxinas*, no de toda la expresión. `[CITA POR VERIFICAR: las cifras 1071/582/361 no se verificaron porque la consulta se interrumpió]` |
| 29 | Perú: más frecuente en viviendas de la costa y en meses cálidos | — | **Pendiente** | `[CITA POR VERIFICAR: consulta interrumpida]`. Según la propia tesis es un reporte de caso, que **no sirve para afirmaciones epidemiológicas**. |
| 30 | Predominio femenino; 21 de 22 casos en la vivienda | — | **Pendiente** | `[CITA POR VERIFICAR: consulta interrumpida; la tesis indica PMC10807011]` |
| 31 | La esfingomielinasa D es la principal responsable de la inflamación y la necrosis | PMID 37739813 · doi:10.1124/molpharm.123.000709 · PMC10877732 | **Corregida en Vancouver** | La cita mezcla datos de dos fuentes: la revista real es *Mol Pharmacol* 105(3):144-54, con otros autores y otro título. Se confirma la acción necrótica; la «inflamatoria» no aparece de forma explícita. |
| 32 | Las clases I y II de SMase D dañan de forma distinta a queratinocitos y fibroblastos | PMID 40243660 · doi:10.3390/ijms26073012 · PMC11988295 | **Corregida en Vancouver** | Los autores son erróneos. El estudio solo usó queratinocitos HaCaT: **hay que quitar «fibroblastos»**. |
| 33 | La coagulopatía es infrecuente; la CID aumenta la mortalidad | PMID 39883062 · doi:10.1093/ajcp/aqaf001 · PMC12137049 | **Corregida en Vancouver** | Las páginas son 822-836. Los autores son erróneos. La afirmación coincide con el resumen (revisión de 263 casos publicados). |
| 34 | Las PLD recombinantes reproducen hemólisis, nefrotoxicidad y dermonecrosis | PMID 41150187 · doi:10.3390/toxins17100486 · PMC12568275 | **Discrepancia con fuente original** | Es un estudio de proteómica de *Sicarius*. La frase aparece solo como cita secundaria; debe citarse la fuente primaria. El número (34) también se usa para Gonzales-Flores. |
| 35 | Caso con insuficiencia respiratoria y hemodiálisis | PMID 37722666 · doi:10.4269/ajtmh.23-0246 · PMC10793048 | **Válida** | El título original dice «Loxocelism». La paciente es una adulta de 26 años que falleció. El número (35) también se usa en el texto para factores intradomiciliarios. |
| 36 | Uso de corticoides, antihistamínicos y antibióticos; infección poco frecuente | PMID 36240248 · doi:10.1371/journal.pntd.0010842 · PMC9604982 | **Corregida en Vancouver** | El número es 16(10), no 16(12). Faltan autores. La afirmación coincide con el texto completo. |
| 37 | Hemólisis tratada con transfusión y antiveneno | PMID 41054635 · doi:10.7759/cureus.91678 · PMC12497441 | **Corregida en Vancouver** | Es 17(9):e91678; «e12497441» era el PMCID. Faltan autores. |
| 38 | Recambio plasmático en hemólisis refractaria. También usada para la definición de «Pronóstico» | PMID 38885577 · doi:10.1016/j.transci.2024.103960 | **Válida** | Los metadatos son correctos. Un reporte de caso no sirve como fuente de la definición de «Pronóstico»; hay que retirarlo de 2.1.3. |
| 39 | Criterios KDIGO de LRA | PMID 23394211 · doi:10.1186/cc11454 · PMC4057151 | **Corregida en Vancouver** | La revista es *Crit Care* 2013;17(1):204, no *Kidney Int*. Los umbrales de 0,3 mg/dL en 48 h, 1,5× la basal y <0,5 mL/kg/h por 6 h se confirman. Se sugiere citar también la guía original: Section 2, *Kidney Int Suppl* 2012;2(1):19-36, PMID 25018918. |
| 40 | Incidencia de LRA pediátrica del 5–30 %; estadio 3 y terapia de reemplazo renal (TRR) | PMID 23744003 · doi:10.2215/CJN.00710113 · PMC3805065 | **Discrepancia con fuente original** | El artículo reporta **33,7 %** en niños (IC 95 %: 26,9–41,3), no 5–30 %. La afirmación sobre el estadio 3 no se pudo verificar. |
| 41 | LRA pediátrica, indicaciones y modalidades de TRR, definiciones | PMID 30135570 · doi:10.1038/s41581-018-0052-0 | **Válida** (metadatos) | El resumen no trata de pediatría, TRR ni definiciones; no hay texto completo en PMC. Es una revisión narrativa usada para definiciones operacionales; se sugiere reemplazarla. |
| 42 | Mecanismos de LRA tóxica; ventajas de la diálisis peritoneal; secuelas | No existe tal como está citada | **No encontrada** | La cita mezcla datos de dos publicaciones. El artículo real es PMID 22743776 (*Crit Care Med* 2012, ECMO + TRRC) y **no respalda ninguna de las tres afirmaciones**. Hay que sustituirla por fuentes pertinentes. |
| 43 | Anemia hemolítica autoinmune tratada con IGIV y corticoides | PMID 39002955 · doi:10.1136/bcr-2024-260045 | **Válida** | Los metadatos y la afirmación coinciden. |
| 44 | Dos casos; uno tratado con recambio plasmático | PMID 41502490 · doi:10.1155/crh/9200571 · PMC12771651 | **Válida** | Los metadatos y la afirmación coinciden con el texto completo. |

**Resumen de estados (44 referencias):**

| Estado | Cantidad | Referencias |
|---|---|---|
| Válidas | 6 | 27, 35, 38, 41, 43, 44 |
| Corregidas en Vancouver | 19 | 2, 3, 10, 11, 12, 13, 15, 18, 19, 22, 25, 26, 28, 31, 32, 33, 36, 37, 39 |
| Discrepancia con la fuente original | 6 | 9, 14, 17, 21, 34, 40 (la 42 también presenta discrepancia, pero se cuenta como no encontrada) |
| No encontradas o por verificar | 13 | 1, 4, 5, 6, 7, 8, 16, 20, 23, 24, 29, 30, 42 |
| **Total** | **44** | |

**Problemas de correlación entre el texto y la lista de referencias:**
- **Orden de primera cita:** las referencias 38, 43 y 44 se citan antes que la 17. Hay que renumerar por orden de primera aparición.
- **Un mismo número usado para dos fuentes:**
  - 34 se usa para Arán-Sekul y también para Gonzales-Flores.
  - 36 se usa para Malaque y también para Neyra-León.
  - 35 se usa para Suárez-Ospino y también para factores intradomiciliarios.
- **Discusión sin citas:** el capítulo IV no tiene ninguna cita numerada.
- **Referencias sin cita en el texto:** no se detectaron. Todas las de la lista se citan al menos una vez, aunque a veces con un número equivocado.

---

## BLOQUE 5. Lista final de referencias corregidas en formato Vancouver

**Criterios de esta lista:**
- Está construida **solo** con metadatos devueltos por PubMed.
- Se conserva la numeración actual para que se pueda cruzar con la tabla anterior. Al renumerar por orden de aparición, hay que reasignar los números.
- Las referencias sin verificar se mantienen tal como las escribió el autor, marcadas con `[CITA POR VERIFICAR]`.
- Las referencias señaladas «sustituir» deben reemplazarse por una fuente pertinente antes de la sustentación.

1. Severino FB, Arriagada C, Carrasco M, et al. Loxoscelismo: revisión de la literatura a propósito de un caso. Ars Med. 2022;47(2):54-60. `[CITA POR VERIFICAR: no indexada en PubMed; se sugiere sustituirla por una fuente epidemiológica primaria]`
2. Zarei H, Azimi A, Ansarian A, Raad A, Tabatabaei H, Roshdi Dizaji S, et al. Incidence of acute kidney injury-associated mortality in hospitalized children: a systematic review and meta-analysis. BMC Nephrol. 2025;26(1):117. doi:10.1186/s12882-025-04033-2
3. Cleto-Yamane TL, Gomes CLR, Koch-Nogueira PC, Suassuna JHR. Acute kidney injury requiring dialysis in children: a multicentric, emerging country perspective. Pediatr Nephrol. 2024;39(7):2253-62. doi:10.1007/s00467-024-06305-9
4. Ministerio de Salud del Perú. Minsa notificó cerca de 9000 casos de loxoscelismo en el país durante los últimos 5 años [Internet]. Lima: MINSA; 2022 [citado AAAA MMM DD]. Disponible en: https://www.gob.pe/institucion/minsa/noticias/582597 `[CITA POR VERIFICAR: fuente gris]`
5. Centro Nacional de Epidemiología, Prevención y Control de Enfermedades. Número de casos de loxoscelismo, Perú 2006-2024 (SE 19-2024) [Internet]. Lima: CDC Perú; 2024 [citado AAAA MMM DD]. `[CITA POR VERIFICAR: fuente gris]`
6. Centro Nacional de Epidemiología, Prevención y Control de Enfermedades. Número de casos de loxoscelismo, Perú 2006-2025 (SE 53-2025) [Internet]. Lima: CDC Perú; 2025 [citado AAAA MMM DD]. `[CITA POR VERIFICAR: fuente gris]`
7. Centro Nacional de Epidemiología, Prevención y Control de Enfermedades. Número de casos de loxoscelismo, Perú 2006-2024 (SE 01-2024) [Internet]. Lima: CDC Perú; 2024 [citado AAAA MMM DD]. `[CITA POR VERIFICAR: fuente gris; diferenciar de la ref. 5]`
8. Juárez SR, Hernández IH, Valderrama PA. Loxoscelismo cutáneo-visceral por mordedura de araña Loxosceles laeta en niños: factores asociados. 2023. `[CITA POR VERIFICAR: sin revista ni volumen; ResearchGate no es una fuente válida]`
9. Gremski LH, da Justa HC, Polli NLC, Schluga PHC, Theodoro JL, Wille ACM, et al. Systemic loxoscelism, less frequent but more deadly: the involvement of phospholipases D in the pathophysiology of envenomation. Toxins (Basel). 2022;15(1):17. doi:10.3390/toxins15010017
10. Gunasekaran PK, Choudhary B, Patel M, Singh S. Cutaneous-visceral loxoscelism with delayed hemolysis in an adolescent. Indian Pediatr. 2023;60(11):958-9.
11. Mani S, Katzman C, Liu V. Histopathology aiding diagnosis of viscerocutaneous loxoscelism in a nonendemic region. JAAD Case Rep. 2024;45:11-7. doi:10.1016/j.jdcr.2023.12.014
12. Mrakic-Sposta S, Vezzoli A, Graci C, Gussoni M, Cimmino A, Dellanoce C, et al. The adjuvant effect of hyperbaric oxygenation for Loxosceles rufescens bite: a case series. Metabolites. 2025;15(7):470. doi:10.3390/metabo15070470 *(Confirmar en la fuente el nombre de la especie en el título; PubMed lo devuelve sin las cursivas.)*
13. Valenzuela Córdova R, Rivera Estrella D, Bernardo JF, Jiménez D, Rodríguez Tudero C, Elías R, et al. Hemoadsorption in multiorgan failure due to viscerocutaneous loxoscelism. Medicina (Kaunas). 2025;61(1):143. doi:10.3390/medicina61010143
14. DiPaola B, Davis J, Baum RA, Akpunonu P, Micciche A. Brown recluse spider envenomation with systemic loxoscelism and delayed hemolysis: a case report. Toxicon. 2023;222:106975. doi:10.1016/j.toxicon.2022.106975
15. Akhouri R, Calleo VJ, Hueschen L. Shock and severe anemia in a pediatric patient. Pediatr Rev. 2026;47(1):64-6. doi:10.1542/pir.2024-006405 *(Verificar en la fuente que el caso sea de loxoscelismo.)*
16. Sencia Puma J. Calidad de vida en pacientes con enfermedad renal crónica del servicio de hemodiálisis y diálisis peritoneal, Hospital EsSalud Cusco, 2022 [tesis]. Cusco: Universidad Nacional de San Antonio Abad del Cusco; 2023. `[CITA POR VERIFICAR: tesis; se sugiere retirarla por no ser pertinente]`
17. Wille ACM, Machado MI, Souza SH, Justa HCD, Fraga-Ferreira ME, Mello ES, et al. Brown spider venom phospholipases D: from potent molecules involved in pathogenesis of brown spider bites to molecular tools for studying ectosomes, ectocytosis, and its applications. Toxins (Basel). 2025;17(2). doi:10.3390/toxins17020070 *(Completar el número de artículo desde la fuente.)*
18. Cavalcante JS, Arruda SST, Riciopo PM, Pucca M, Ferreira Junior RS. Diagnosis of human envenoming by terrestrial venomous animals: routine, advances, and perspectives. Toxicon X. 2024;24:100211. doi:10.1016/j.toxcx.2024.100211
19. Silva-Magalhães R, Gomes Dos Santos AM, Silva-Araújo AL, Peres-Damásio PL, Gonçalves de Alvarenga V, Souza de Oliveira L, et al. Venom from Loxosceles spiders collected in southeastern and northeastern Brazilian regions cause hemotoxic effects on human blood components. Toxins (Basel). 2024;16(12). doi:10.3390/toxins16120532 *(Completar el número de artículo desde la fuente.)*
20. Martínez W, Amarista M. Nivel de conocimiento sobre accidentes ponzoñosos por loxoscelismo en pobladores de Arequipa, Perú, 2019. Salud Tecnol Vet. 2024;12(1):1-12. `[CITA POR VERIFICAR: no indexada en PubMed]`
21. Martins JG, Pardal PPO, Brescovit AD, Procópio REL. An overview of spider accidents in the Brazilian Amazon. J Venom Anim Toxins Incl Trop Dis. 2025;31:e20240057. doi:10.1590/1678-9199-JVATITD-2024-0057 *(No respalda la afirmación sobre Loxosceles; reformular o sustituir.)*
22. Antunes BC, Polli NLC, Schluga PHC, Silva TPD, Wille ACM, Locatelli-Dittrich R, et al. Production and functional evaluation of anti-sera raised by immunizations of rabbits with mutated recombinant phospholipases-D. Biomedicines. 2022;11(1). doi:10.3390/biomedicines11010079 *(Completar el número de artículo desde la fuente. Para la distribución de especies se sugiere una fuente epidemiológica.)*
23. Humboldt-Paputsachis C, Rocha-León M, et al. Presencia del género Loxosceles en los municipios de Cercado y Mecapaca, Departamento de La Paz, Bolivia. J Selva Andina Res Soc. 2025;16(2):e2025004. `[CITA POR VERIFICAR: no indexada en PubMed]`
24. Neyra-León J, Rebaza-Mateo A, Díaz-Monge JC. Loxoscelismo víscero-hemolítico: una forma de presentación tórpida de la enfermedad. Rev Méd Panacea. 2025;14(1):e632. `[CITA POR VERIFICAR: no indexada en PubMed]`
25. Gonzales-Flores C, Vigo NI, Atamari-Anahui N, Cuadros-Castro J. Persistent facial edema due to spider bite: a case of edematous cutaneous loxoscelism. Bol Med Hosp Infant Mex. 2025;82(4):267-71. doi:10.24875/BMHIM.24000125
26. Meadows JW, Shayesteh N, Crandall E, Watkins SA. Fatal viscerocutaneous brown recluse envenomation with orbital compartment syndrome. Cureus. 2024;16(5):e60943. doi:10.7759/cureus.60943
27. Cortés-Fossati F, Méndez M. Comparative medical importance of spider bites in Spain over 1997-2020: a retrospective study based on hospital cases coded using ICD. J Med Entomol. 2024;61(4):891-9. doi:10.1093/jme/tjae045
28. Medina-Santos R, Fernandes Costa TG, Silva de Assis TC, Kalapothakis Y, de Almeida Lima S, do Carmo AO, et al. Analysis of NGS data from Peruvian Loxosceles laeta spider venom gland reveals toxin diversity. Comp Biochem Physiol Part D Genomics Proteomics. 2022;43:101017. doi:10.1016/j.cbd.2022.101017 `[CITA POR VERIFICAR: orden y forma completa de los autores, y las cifras 1071/582/361]`
29. Luna-Muñoz C, Reyes-Florian G, Seminario-Aliaga M, Correa-López LE, Quiñones-Laveriano DM. Cutaneous loxoscelism predominantly edematous: clinical case. Rev Fac Med Hum. 2022;22(3):676-81. `[CITA POR VERIFICAR: verificación interrumpida; es un reporte de caso usado para un dato epidemiológico]`
30. Amorim MLP, Gonçalves de Mello MJ, et al. Brown spiders (Loxosceles) are taking hold in Pernambuco, Brazil: a case series, 2018-2022. Epidemiol Serv Saude. 2024;33:e2023568. `[CITA POR VERIFICAR: verificación interrumpida]`
31. Lachmayr H, Merrill AH. A brief overview of the toxic sphingomyelinase Ds of brown recluse spider venom and other organisms and simple methods to detect production of its signature cyclic ceramide phosphate. Mol Pharmacol. 2024;105(3):144-54. doi:10.1124/molpharm.123.000709
32. Pinto BF, Lopes PH, Trufen CEM, Ching Ching AT, Junqueira de Azevedo ILM, Nishiyama-Jr MY, et al. Differential cellular responses to class I and II sphingomyelinase D: unraveling the mechanisms of Loxosceles venom-induced dermonecrosis and potential therapeutic targets. Int J Mol Sci. 2025;26(7):3012. doi:10.3390/ijms26073012
33. Hart SA, Gailani D, Bibb LA, Zwerner JP, Booth GS, Jacobs JW. Coagulation abnormalities following brown recluse spider (Loxosceles reclusa) envenomation: a description of 2 cases and review of the literature. Am J Clin Pathol. 2025;163(6):822-36. doi:10.1093/ajcp/aqaf001
34. Arán-Sekul T, San Francisco J, Rojas J, Moon KM, Foster L, Catalán A. Proteome analysis of the six-eyed sand-spider Sicarius thomisoides venom. Toxins (Basel). 2025;17(10):486. doi:10.3390/toxins17100486 *(Sustituir por la fuente primaria de los efectos de las PLD recombinantes de Loxosceles.)*
35. Suárez-Ospino NI, Díaz-Anaya E, Ochoa-Díaz AF. Dermatological features as a diagnostic clue in systemic loxocelism caused by brown recluse spider bite. Am J Trop Med Hyg. 2023;109(6):1207-8. doi:10.4269/ajtmh.23-0246
36. Malaque CMS, Novaes CTG, Piorelli RO, Risk JY, Murad JC, Lara AN, et al. Impact of antivenom administration on the evolution of cutaneous lesions in loxoscelism: a prospective observational study. PLoS Negl Trop Dis. 2022;16(10):e0010842. doi:10.1371/journal.pntd.0010842
37. Guadarrama-Fernández C, Longino JA, Villalba-Ríos N, Rojas-Alanís MA, Cervantes-Sánchez CR. Successful management of intravascular hemolysis caused by systemic loxoscelism with antivenom: a case report. Cureus. 2025;17(9):e91678. doi:10.7759/cureus.91678
38. Mehr J, Kim J. The use of therapeutic plasma exchange in systemic loxoscelism induced treatment resistant hemolytic anemia: a case report. Transfus Apher Sci. 2024;63(4):103960. doi:10.1016/j.transci.2024.103960
39. Kellum JA, Lameire N; KDIGO AKI Guideline Work Group. Diagnosis, evaluation, and management of acute kidney injury: a KDIGO summary (Part 1). Crit Care. 2013;17(1):204. doi:10.1186/cc11454
    - *Complementaria sugerida:* Section 2: AKI Definition. Kidney Int Suppl (2011). 2012;2(1):19-36. doi:10.1038/kisup.2011.32. Hay que añadir el autor corporativo (KDIGO) desde la fuente original.
40. Susantitaphong P, Cruz DN, Cerda J, Abulfaraj M, Alqahtani F, Koulouridis I, et al. World incidence of AKI: a meta-analysis. Clin J Am Soc Nephrol. 2013;8(9):1482-93. doi:10.2215/CJN.00710113
41. Hoste EAJ, Kellum JA, Selby NM, Zarbock A, Palevsky PM, Bagshaw SM, et al. Global epidemiology and outcomes of acute kidney injury. Nat Rev Nephrol. 2018;14(10):607-25. doi:10.1038/s41581-018-0052-0
42. `[CITA POR VERIFICAR: la referencia citada no existe en PubMed; el artículo real (Selewski DT, et al. Crit Care Med. 2012;40(9):2694-9. doi:10.1097/CCM.0b013e318258ff01) no respalda las afirmaciones. Sustituir.]`
43. Mai D, Muthukumarasamy N, Ford B, Sekar P. Systemic loxoscelism leading to autoimmune haemolytic anaemia in a healthy young adult. BMJ Case Rep. 2024;17(7):e260045. doi:10.1136/bcr-2024-260045
44. Al-Sadi A, Adhikari A, Jawarneh I, Ali E, Shrestha A. Clinical spectrum of hemolytic anemia in loxoscelism: report of two cases highlighting variable severity and management. Case Rep Hematol. 2026;2026:9200571. doi:10.1155/crh/9200571

---

*Fuente de la verificación bibliográfica: PubMed / PubMed Central (NCBI, National Library of Medicine), consultado el 20/11/2026 mediante el conector oficial. Los DOI de cada artículo figuran en la tabla y en la lista.*
