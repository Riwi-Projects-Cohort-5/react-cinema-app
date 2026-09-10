import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dropdown } from "./Dropdown";

const OPTIONS = [
  { value: "col", label: "Colombia" },
  { value: "arg", label: "Argentina" },
  { value: "usa", label: "Estados Unidos" },
];

describe("Dropdown", () => {
  it("renders the label and the placeholder", () => {
    render(<Dropdown options={OPTIONS} label="País" placeholder="Selecciona" />);

    expect(screen.getByText("País")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Selecciona");
  });

  it("opens the listbox on click and closes it with Escape", () => {
    render(<Dropdown options={OPTIONS} />);

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(OPTIONS.length);

    fireEvent.keyDown(trigger, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes the listbox when clicking outside", () => {
    render(<Dropdown options={OPTIONS} />);

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("selects an option with ArrowDown + Enter and shows its label", () => {
    render(<Dropdown options={OPTIONS} />);

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(trigger).toHaveTextContent("Argentina");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("selects an option on click", () => {
    render(<Dropdown options={OPTIONS} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Estados Unidos" }));

    expect(screen.getByRole("combobox")).toHaveTextContent("Estados Unidos");
  });

  it("filters options when filterable and selects the filtered result", () => {
    render(<Dropdown options={OPTIONS} filterable placeholder="Selecciona" />);

    fireEvent.click(screen.getByRole("combobox"));

    const search = screen.getByPlaceholderText("Buscar…");
    fireEvent.change(search, { target: { value: "Ar" } });

    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: "Argentina" })).toBeInTheDocument();

    fireEvent.keyDown(search, { key: "Enter" });

    expect(screen.getByRole("combobox")).toHaveTextContent("Argentina");
  });

  it("shows a no-results message when the filter matches nothing", () => {
    render(<Dropdown options={OPTIONS} filterable />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByPlaceholderText("Buscar…"), { target: { value: "Zzz" } });

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("calls onChange with the selected value when controlled", () => {
    const onChange = vi.fn();
    render(<Dropdown options={OPTIONS} value={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Colombia" }));

    expect(onChange).toHaveBeenCalledWith("col");
  });

  it("does not match a number value to a string option that stringifies the same", () => {
    render(
      <Dropdown<number | string>
        options={[
          { value: 1, label: "Uno" },
          { value: "1", label: "Uno (texto)" },
        ]}
        value={1}
        onChange={() => {}}
      />
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Uno");
    expect(screen.getByRole("combobox")).not.toHaveTextContent("Uno (texto)");

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "Uno" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Uno (texto)" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("does not treat distinct objects that stringify the same as equal", () => {
    const selected = { code: "col" };
    const other = { code: "col" };

    render(
      <Dropdown<{ code: string }>
        options={[
          { value: selected, label: "Colombia" },
          { value: other, label: "Otro" },
        ]}
        value={selected}
        onChange={() => {}}
      />
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Colombia");

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "Colombia" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("option", { name: "Otro" })).toHaveAttribute("aria-selected", "false");
  });

  it("moves the combobox pattern to the search input when filterable and open", () => {
    render(<Dropdown options={OPTIONS} filterable />);

    const trigger = screen.getByRole("combobox");
    expect(trigger.tagName).toBe("BUTTON");

    fireEvent.click(trigger);

    const search = screen.getByRole("combobox");
    expect(search.tagName).toBe("INPUT");
    expect(search).toHaveAttribute("aria-expanded", "true");
    expect(search).toHaveAttribute("aria-autocomplete", "list");
    expect(search).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-0"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
