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
});