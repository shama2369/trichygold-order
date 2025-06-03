export interface Order {
  _id?: string;
  employeeId: string;
  employeeName: string;
  items: {
    tea?: number;
    coffee?: number;
    freshJuice?: number;
    tinJuice?: number;
    sandwich?: number;
    sulaimani?: number;
    [key: string]: number | undefined;
  };
  timestamp?: Date;
}