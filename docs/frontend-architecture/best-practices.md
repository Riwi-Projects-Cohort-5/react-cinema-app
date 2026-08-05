# Best Practices

## Descripción

Este documento reúne las buenas prácticas que deberán seguir todos los integrantes del equipo durante el desarrollo del frontend.

Su objetivo es mantener un código limpio, consistente y fácil de mantener.

---

## Separación de responsabilidades

Cada archivo debe tener una única responsabilidad.

Evitar mezclar lógica de negocio, presentación y comunicación con el backend dentro del mismo componente.

---

## Reutilización

Antes de crear un nuevo componente, verificar si existe uno que pueda reutilizarse.

Evitar la duplicación de código.

---

## Componentes

Los componentes deben ser pequeños, reutilizables y fáciles de comprender.

Cuando un componente comience a asumir demasiadas responsabilidades, deberá dividirse en componentes más específicos.

---

## Lógica de negocio

La lógica de negocio no debe implementarse directamente en los componentes de presentación.

Debe mantenerse separada para facilitar su mantenimiento y reutilización.

---

## Estado

Utilizar estado local únicamente cuando la información pertenezca al componente.

Cuando varios componentes necesiten compartir información, deberá utilizarse un estado compartido.

---

## Comunicación con el backend

Toda comunicación con la API debe centralizarse en una capa dedicada para este propósito.

Evitar realizar peticiones HTTP directamente desde los componentes.

---

## Código limpio

- Utilizar nombres descriptivos.
- Eliminar código sin uso.
- Evitar funciones excesivamente largas.
- Evitar condicionales innecesariamente complejos.
- Mantener una estructura consistente.

---

## Escalabilidad

Cada nueva funcionalidad debe integrarse respetando la arquitectura del proyecto.

Evitar soluciones que dificulten el crecimiento futuro de la aplicación.

---

## Trabajo colaborativo

- Mantener las tareas actualizadas en Jira.
- Trabajar siempre sobre una rama propia.
- Abrir Pull Request antes de integrar cambios.
- Atender las observaciones del Code Review.
- Mantener una comunicación constante con el equipo cuando un cambio afecte varias funcionalidades.

---

## Documentación

Cuando una decisión técnica modifique la arquitectura o el flujo de trabajo del proyecto, la documentación correspondiente deberá actualizarse.
