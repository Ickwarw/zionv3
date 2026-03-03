import React, { useState, useEffect } from 'react';
import { Package, Edit, Trash2, QrCode, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface ReportListProps {
  resultList: any[];
}


const ReportList = ({ resultList}: ReportListProps) => {

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {/* <TableRow>
              {headerList.map((header) => (
                <TableHead>{header}</TableHead>
                ))
              }
            </TableRow> */}
            {resultList.length > 0 && (
              <TableRow>
                {Object.keys((resultList[0] ?? {}) as Record<string, unknown>).map((key, i) => (
                    <TableHead key={i} className="font-bold">
                      {key}
                    </TableHead>
                  ))
                } 
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {resultList?.length
              ? resultList.map((record, index) => (
            // {resultList.map((record, index) => (
              <TableRow key={index}>
                {Object.values(record).map((value, i) => (
                  <TableCell key={i} className="text-gray-600">
                    {String(value)}
                  </TableCell>
                ))}
              </TableRow>
            ))
            : <TableRow 
                className="hover:bg-gray-50 cursor-pointer"
              >
                <TableCell className="font-mono text-sm">
                  <div className="font-medium text-gray-900">Nenhum Registro encontrado</div>
                </TableCell>
                
              </TableRow>
          }
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default ReportList;
