const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'modules', 'cutting', 'CuttingDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const startMarker = '              {/* Desktop & Landscape Tablet Table */}';
const endMarker = '                </table>';
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker) + endMarker.length;
if (startIdx === -1 || endIdx < endMarker.length) { console.error('Markers not found'); process.exit(1); }
const newTable = `              {/* Desktop & Landscape Tablet Table */}
              <div className="hidden md:block overflow-x-auto w-full">
                <table className="min-w-[900px] w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-300 text-xs font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-2 pl-4 whitespace-nowrap">Serial & Bill</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Garments</th>
                      <th className="py-3 px-2 whitespace-nowrap">Order / Due</th>
                      <th className="py-3 px-2">Priority</th>
                      <th className="py-3 px-2 whitespace-nowrap">Material</th>
                      <th className="py-3 px-2 whitespace-nowrap">Status</th>
                      <th className="py-3 px-2 pr-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.map(order => {
                      const cuttingStatus = getOrderCuttingStatus(order);
                      const totalItems = getTotalPieces(order);
                      const garmentSummary = getGarmentSummaryText(order);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-3 px-2 pl-4 font-mono whitespace-nowrap">
                            <span className="block text-xs font-black text-slate-400">{order.serialNumber}</span>
                            <span className="text-sm font-extrabold text-[#233B5D]">{order.id}</span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-extrabold text-sm text-[#191C1E] group-hover:text-[#233B5D] max-w-[130px] truncate">{order.customer.customerName}</div>
                            <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" /><span>{order.customer.primaryPhone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-bold text-slate-800 text-xs max-w-[140px] truncate" title={garmentSummary}>{garmentSummary}</div>
                            <div className="text-xs text-slate-500 mt-0.5"><strong>{totalItems} pcs</strong></div>
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap">
                            <div className="text-xs text-slate-500 font-semibold">{order.billing.orderDate}</div>
                            <div className="text-xs font-extrabold text-red-600 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-red-500 flex-shrink-0" /><span>{order.billing.dueDate}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap">
                            <span className={\`inline-block px-2 py-0.5 rounded-lg text-xs font-black uppercase \${order.billing.priority === 'Express' ? 'bg-red-600 text-white' : order.billing.priority === 'Urgent' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}\`}>{order.billing.priority}</span>
                          </td>
                          <td className="py-3 px-2 whitespace-nowrap">{getMaterialStatusBadge(order)}</td>
                          <td className="py-3 px-2 whitespace-nowrap">
                            <span className={\`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black uppercase \${cuttingStatus === 'CUTTING_COMPLETED' ? 'bg-[#16834A] text-white' : cuttingStatus === 'IN_CUTTING' ? 'bg-[#147D75] text-white' : cuttingStatus === 'ON_HOLD' ? 'bg-[#D64545] text-white' : cuttingStatus === 'READY_FOR_CUTTING' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'}\`}>
                              {cuttingStatus === 'IN_CUTTING' && <Scissors className="w-3 h-3 animate-bounce" />}
                              {cuttingStatus === 'CUTTING_COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                              {cuttingStatus === 'ON_HOLD' && <PauseCircle className="w-3 h-3" />}
                              <span>{cuttingStatus.replace(/_/g, ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3 px-2 pr-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button type="button" onClick={() => setPrintOrder(order)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer" title="Print Worksheet"><Printer className="w-4 h-4" /></button>
                              <button type="button" onClick={() => setSelectedOrder(order)} className="h-9 px-3 rounded-lg bg-[#233B5D] hover:bg-[#1a2d47] text-white text-xs font-bold inline-flex items-center gap-1 shadow transition-all cursor-pointer whitespace-nowrap">
                                <span>Open Work Order</span><ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>`;
const newContent = content.substring(0, startIdx) + newTable + content.substring(endIdx);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: replaced', endIdx - startIdx, '->', newTable.length, 'chars');
