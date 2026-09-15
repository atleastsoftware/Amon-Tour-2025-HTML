/**
 * Kept deliberately dependency-free because this function is also embedded
 * verbatim in the generated browser bundle.
 */
export function serializeForm(form: any): Record<string, unknown> {
  const controls = Array.from(form.elements || form.querySelectorAll("input,select,textarea"))
    .filter((control: any) => control.name && !control.disabled) as any[];
  const groups = new Map<string, any[]>();

  for (const control of controls) {
    const name = String(control.name).replace(/\[\]$/, "");
    const group = groups.get(name) || [];
    group.push(control);
    groups.set(name, group);
  }

  const body: Record<string, unknown> = {};
  for (const [name, group] of groups) {
    const first = group[0];
    if (first.type === "checkbox") {
      body[name] = group.length === 1
        ? Boolean(first.checked)
        : group.filter((control) => control.checked).map((control) => control.value);
      continue;
    }
    if (first.type === "radio") {
      const selected = group.find((control) => control.checked);
      if (selected) body[name] = selected.value;
      continue;
    }

    const values = group.map((control) => {
      const numeric = control.type === "number" || control.dataset?.valueType === "number";
      return numeric ? Number(control.value) : control.value;
    });
    body[name] = values.length === 1 ? values[0] : values;
  }
  return body;
}