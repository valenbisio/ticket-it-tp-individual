---
name: accesibilidad-front
description: Guía al agente para escribir y revisar UI accesible (WCAG 2.2 nivel AA, principios POUR) en React web y React Native / Expo. Activar siempre que se cree o modifique un formulario, input, botón, login, registro, mensaje de error o éxito, modal o pantalla de la app, o cuando el usuario mencione accesibilidad, a11y, WCAG, lector de pantalla, contraste, foco, teclado, aria, accessibilityLabel o tests E2E, aunque no pida explícitamente "accesibilidad".
---

# Accesibilidad en el frontend

La accesibilidad es parte de la calidad del software, como la seguridad o el rendimiento: se aplica mientras se escribe el código, no al final. Objetivo: nivel **AA** de WCAG 2.2. Principios POUR: Perceptible, Operable, Comprensible, Robusto.

## Cuándo usarla
- Se crea o modifica cualquier componente de UI interactivo: formularios, inputs, botones, checkboxes, links, modales, toasts, pantallas de login o registro.
- Se agregan mensajes de error, éxito o carga.
- Se pide revisar, auditar o "mejorar" una pantalla o componente.
- Se escriben tests E2E o de componentes sobre la UI (los selectores accesibles también hacen los tests más estables).
- El usuario menciona accesibilidad, a11y, WCAG, lector de pantalla, contraste, foco, teclado o aria.

## Pasos

1. **Identificar la plataforma.** Archivos web (`.jsx`/`.tsx` con HTML, CSS) usan las reglas web. Componentes de React Native / Expo (`View`, `Pressable`, `TextInput`) usan las equivalencias móviles de la tabla del paso 3.

2. **Aplicar las 9 pautas a lo que se escribe o revisa**, en este orden:

   1. **Etiquetas asociadas** (WCAG 1.3.1, 3.3.2, 4.1.2). Cada campo con `<label htmlFor>` + `id`; el placeholder no reemplaza al label. Si el diseño no muestra texto, `aria-label`.
      ```jsx
      <label htmlFor="email">Email</label>
      <input id="email" type="email" placeholder="nombre@dominio.com" />
      ```
   2. **Contraste** (1.4.3). Texto y fondo con ratio ≥ 4.5:1. Evitar grises claros sobre blanco (`#b9bdc9` = 1.9:1 no cumple; `#1f2433` = 9.6:1 sí).
   3. **Errores claros y asociados** (1.4.1, 3.3.1, 3.3.3). Nunca solo color: ícono + texto que diga qué pasó y cómo corregirlo, asociado al campo.
      ```jsx
      <input id="email" type="email" aria-invalid={!!err} aria-describedby="email-err" />
      {err && <p id="email-err"><WarnIcon /> {err}</p>}
      ```
   4. **Foco visible** (2.4.7, 2.1.1). Nunca `outline: none` sin reemplazo.
      ```css
      button:focus-visible, input:focus-visible { outline: 3px solid #0a58ff; outline-offset: 2px; }
      ```
   5. **HTML semántico** (2.1.1, 4.1.2). `<button type="submit">`, `<nav>`, `<main>`, `<header>`, `<footer>` en vez de `<div onClick>`. ARIA solo cuando no existe la etiqueta adecuada.
   6. **Tamaño táctil y legibilidad** (2.5.8, 1.4.4). Targets ≥ 44×44 px, texto de 16 px en `rem`, checkbox de 24 px con label clickeable, sin romper el layout al 200% de zoom.
   7. **Tipo de input y autocomplete** (1.3.5). `type="email"`, `autoComplete="email"`, `inputMode="email"`; `type="tel"` para teléfono; `autoComplete="name"` para nombre.
   8. **Botones de solo ícono** (1.1.1, 4.1.2). Nombre accesible y ícono decorativo oculto.
      ```jsx
      <button type="button" onClick={toggle} aria-label="Mostrar contraseña" aria-pressed={visible}>
        <EyeIcon aria-hidden="true" />
      </button>
      ```
   9. **Mensajes dinámicos y foco** (4.1.3, 2.4.3). `role="status"` + `aria-live="polite"` para éxito; `role="alert"` para errores urgentes; mover el foco con `ref.focus()` solo si hay que corregir algo.
      ```jsx
      <div role="status" aria-live="polite">{ok && "¡Cuenta creada con éxito!"}</div>
      useEffect(() => { if (error) errRef.current?.focus(); }, [error]);
      ```

3. **Si es React Native / Expo, traducir cada pauta a su equivalente móvil:**

   | Pauta | React Native |
   |-------|--------------|
   | Nombre accesible | `accessibilityLabel` |
   | Rol | `accessibilityRole="button" \| "link" \| "header" \| "alert"` |
   | Estado | `accessibilityState={{ disabled, selected, checked, expanded }}` |
   | Pista de acción | `accessibilityHint` |
   | Mensajes dinámicos | `accessibilityLiveRegion="polite"` (Android) y `AccessibilityInfo.announceForAccessibility(msg)` |
   | Mover foco del lector | `AccessibilityInfo.setAccessibilityFocus(findNodeHandle(ref))` |
   | Ícono decorativo | `accessibilityElementsHidden` (iOS) / `importantForAccessibility="no-hide-descendants"` (Android) |
   | Tamaño táctil | `minHeight: 44`, `minWidth: 44` o `hitSlop` |
   | Teclado e inputs | `keyboardType="email-address"`, `autoComplete="email"`, `textContentType="emailAddress"` |

   No transmitir información solo por color y no depender de gestos sin alternativa.

4. **Verificar con el checklist** antes de dar el trabajo por terminado:
   - ¿Cada campo tiene label visible y asociado?
   - ¿Contraste ≥ 4.5:1?
   - ¿Errores con ícono + texto concreto, asociados al campo?
   - ¿Se ve el foco y se puede operar todo solo con teclado (Tab, Shift+Tab, Enter, Espacio, Esc)?
   - ¿Hay elementos semánticos (o roles correctos en RN) en lugar de contenedores genéricos con `onClick`?
   - ¿Targets ≥ 44 px y texto de 16 px en `rem`?
   - ¿Tipos de input y autocomplete correctos?
   - ¿Botones de solo ícono con nombre accesible?
   - ¿Éxito, error y carga se anuncian?

5. **Agregar o sugerir tests** cuando se crea un formulario o pantalla:
   - Estático: `eslint-plugin-jsx-a11y` con `plugin:jsx-a11y/recommended`.
   - Componente: `jest-axe` + Testing Library → `expect(await axe(container)).toHaveNoViolations()`.
   - E2E con Playwright: `@axe-core/playwright` con `withTags(['wcag2a', 'wcag2aa'])` y `expect(r.violations).toEqual([])`; un test de navegación solo con teclado (`keyboard.press('Tab')` y `toBeFocused()`).
   - Selectores en este orden: `getByRole` > `getByLabel` > `getByText` > `getByTestId`; evitar CSS/XPath. Esperas con `expect(...).toBeVisible()`, nunca `waitForTimeout`.
   - Aclarar que lo automático no reemplaza probar con lector de pantalla (NVDA, VoiceOver, TalkBack) ni con zoom al 200%.

6. **Preferir componentes ya accesibles** (Radix UI, React Aria, Headless UI) antes de armar modales, menús o selects desde cero en web.

## Formato de salida

**Al escribir código nuevo:** entregar el código con las pautas ya aplicadas y, al final, una línea corta con las pautas cubiertas, por ejemplo: `Pautas aplicadas: 1 (labels), 3 (errores con aria-describedby), 5 (button semántico), 9 (role="status")`.

**Al revisar código existente:** entregar una tabla de hallazgos y luego el código corregido.

| # | Pauta | Problema encontrado | Criterio WCAG | Corrección |
|---|-------|---------------------|---------------|------------|
| 1 | Etiquetas | Input de email solo con placeholder | 1.3.1 (A) | Agregar `<label htmlFor="email">` |

**Siempre:** cerrar con el checklist del paso 4 marcado (✓ cumple, ✗ no cumple, N/A no aplica) y, si falta, una nota de qué probar a mano (teclado, lector de pantalla, zoom).
