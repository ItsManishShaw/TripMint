export type Paise = number;

export const INR = {
  toPaise: (rupees: number): Paise => Math.round(rupees * 100),
  toRupees: (paise: Paise): number => Math.round(paise) / 100,
  format: (paise: Paise): string => {
    const rupees = INR.toRupees(paise);
    return rupees.toLocaleString("en-IN", { style: "currency", currency: "INR" });
  }
};
