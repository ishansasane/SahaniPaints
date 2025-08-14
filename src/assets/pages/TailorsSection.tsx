import React, { useEffect } from "react";

interface TailorsSectionProps {
  selections: any[];
  setNavState: (nav: string) => void;
}

const TailorsSection: React.FC<TailorsSectionProps> = ({ updateTailorRate, updateTailorRemark, updateTailorStatus, updateTailorData, tailors, selections, setNavState, statusArray, tailorsArray, setTailorsArray }) => {

  return (
    <div className="flex flex-col w-full justify-between gap-3 mt-3">
  <p className="font-semibold">Tailors</p>

  <div className="overflow-x-auto w-full">
    <table className="w-full min-w-[1000px]">
      <thead>
        <tr className="text-center bg-gray-100">
          <td>Sr.No.</td>
          <td>Product</td>
          <td>Reference</td>
          <td>Room</td>
          <td>Width</td>
          <td>Height</td>
          <td>Parts/Sq.Ft</td>
          <td>Rate</td>
          <td>Tailor</td>
          <td>Status</td>
          <td>Remark</td>
        </tr>
      </thead>
      <tbody>
        {tailorsArray != undefined &&
          tailorsArray.map((tailor, index) => {
            if (!tailor.item || tailor.item[2] !== "Tailoring") return null;

            const selection = selections[tailor.mainindex];
            const area = selection?.areacollection[tailor.groupIndex];

            return (
              <tr key={index} className="text-center border-t">
                <td>{index + 1}</td>
                <td>{tailor.item[0]}</td>
                <td>{area?.reference || "-"}</td>
                <td>{selection?.area || "-"}</td>
                <td>{area?.measurement?.width}</td>
                <td>{area?.measurement?.height}</td>
                <td>{area?.measurement?.quantity}</td>
                <td>
                  <input
                    type="text"
                    className="border rounded-lg pl-2 h-8 w-[6vw] min-w-[60px]"
                    value={tailor.rate}
                    onChange={(e) => updateTailorRate(index, e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="border px-2 py-1 rounded mr-2"
                    value={tailor.tailorData}
                    onChange={(e) => updateTailorData(index, e.target.value)}
                  >
                    <option value="">Choose Tailor</option>
                    {tailors.map((data, i) => (
                      <option key={i} value={data}>
                        {data[0]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="border px-2 py-1 rounded mr-2"
                    value={tailor.status}
                    onChange={(e) => updateTailorStatus(index, e.target.value)}
                  >
                    <option value="">Pending</option>
                    {statusArray.map((data, i) => (
                      <option key={i} value={data}>
                        {data}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  <input
                    className="border rounded-lg pl-2 h-8 w-[8vw] min-w-[80px]"
                    type="text"
                    value={tailor.remark}
                    onChange={(e) => updateTailorRemark(index, e.target.value)}
                  />
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>

   <div className="flex flex-row justify-between">
                <button onClick={() => setNavState("Goods")} style={{ borderRadius : "8px" }} className="rounded-lg border px-2 h-8 bg-white">Back</button>
                <button  onClick={() => setNavState("Payments")} style={{ borderRadius : "8px" }} className="rounded-lg text-white border px-2 h-8 bg-sky-600">Next</button>
              </div>
</div>

  );
};

export default TailorsSection;
