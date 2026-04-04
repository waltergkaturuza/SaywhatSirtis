import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fp = path.join(__dirname, '../src/app/risk-management/matrix/page.tsx')
let s = fs.readFileSync(fp, 'utf8')

const startGrid = '              {/* Matrix Grid */}'
const endGrid = '              {/* Legend */}'
const i = s.indexOf(startGrid)
const j = s.indexOf(endGrid)
if (i === -1 || j === -1) {
  console.error('grid markers', i, j)
  process.exit(1)
}

const newGrid = `              {/* Matrix Grid (live register data) */}
              <div className="space-y-2">
                {matrix.map((row) => {
                  const prob = row[0]?.probability ?? 0
                  const probLabel =
                    probabilityLevels.find((p) => p.value === prob)?.label ||
                    String(prob)
                  return (
                    <div key={prob} className="grid grid-cols-6 gap-2 items-center">
                      <div className="text-right pr-4">
                        <div className="transform -rotate-90 text-sm font-bold text-gray-700 whitespace-nowrap">
                          {probLabel}
                        </div>
                      </div>
                      {row.map((cell) => (
                        <div
                          key={\`\${cell.probability}-\${cell.impact}\`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleCellClick(
                                cell.probability,
                                cell.impact,
                                cell.riskLevel
                              )
                            }
                          }}
                          className={matrixCellSurfaceClass(cell.riskLevel)}
                          onClick={() =>
                            handleCellClick(
                              cell.probability,
                              cell.impact,
                              cell.riskLevel
                            )
                          }
                        >
                          <div className="font-bold text-2xl text-white">
                            {cell.count}
                          </div>
                          <div className="text-xs mt-1 font-semibold text-white/90">
                            Score: {cell.probability * cell.impact}
                          </div>
                          <div className="text-xs font-bold text-white bg-black/25 px-2 py-1 rounded mt-1">
                            {cell.riskLevel}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>

`

s = s.slice(0, i) + newGrid + s.slice(j)

const startSum = '              {/* Risk Summary at Bottom */}'
const endSum = '        {/* Risk Details Modal */}'
const i2 = s.indexOf(startSum)
const j2 = s.indexOf(endSum)
if (i2 === -1 || j2 === -1) {
  console.error('summary markers', i2, j2)
  process.exit(1)
}

const newSum = `              {/* Risk Summary at Bottom */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-red-500 to-red-700 rounded-xl border-2 border-red-800 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-full mr-4"></div>
                  <div>
                    <div className="font-bold text-3xl text-white">{summaryBands.critical}</div>
                    <div className="text-sm text-red-100 font-semibold">Critical</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl border-2 border-orange-800 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-full mr-4"></div>
                  <div>
                    <div className="font-bold text-3xl text-white">{summaryBands.high}</div>
                    <div className="text-sm text-orange-100 font-semibold">High</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl border-2 border-yellow-700 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-full mr-4"></div>
                  <div>
                    <div className="font-bold text-3xl text-white">{summaryBands.medium}</div>
                    <div className="text-sm text-yellow-100 font-semibold">Medium</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-green-500 to-green-700 rounded-xl border-2 border-green-800 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-full mr-4"></div>
                  <div>
                    <div className="font-bold text-3xl text-white">{summaryBands.low}</div>
                    <div className="text-sm text-green-100 font-semibold">Low</div>
                  </div>
                </div>
              </div>

`

s = s.slice(0, i2) + newSum + s.slice(j2)
fs.writeFileSync(fp, s)
console.log('patched', fp)
