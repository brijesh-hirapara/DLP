import { SorterResult } from "antd/lib/table/interface";
import { useState } from "react";

type SortingState = {
  sortingPropertyName?: string;
  sortingIsDescending?: boolean;
};

const orders = {
  ascend: "ascend",
  descend: "descend",
};

export const useTableSorting = () => {
  const [sorting, setSorting] = useState<SortingState>({});

  const onSorterChange = (sorter: SorterResult<any> | SorterResult<any>[]) => {
    const { order, columnKey }: SorterResult<any> = Array.isArray(sorter)
      ? sorter[0]
      : sorter;

    setSorting({
      sortingIsDescending: order === orders.descend,
      sortingPropertyName: columnKey?.toString(),
    });
  };

  return {
    onSorterChange,
    sorting,
  };
};
