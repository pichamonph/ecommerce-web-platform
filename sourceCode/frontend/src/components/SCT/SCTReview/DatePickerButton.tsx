"use client"

import * as React from "react"
import { FaCalendarAlt } from 'react-icons/fa'; // ไอคอนปฏิทิน
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// ฟังก์ชันช่วยในการสร้าง Array ชั่วโมง/นาที
const getSelectOptions = (limit: number) => {
  return Array.from({ length: limit }, (_, i) => i);
};

export function DatePickerButton() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [hour, setHour] = React.useState(new Date().getHours()); // State สำหรับ ชั่วโมง
  const [minute, setMinute] = React.useState(new Date().getMinutes()); // State สำหรับ นาที
  
  // สร้าง Array สำหรับ select option
  const hours = getSelectOptions(24);
  const minutes = getSelectOptions(60);

  // ฟังก์ชันหลักในการเลือกวันและเวลา
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // เมื่อเลือกวันใหม่ ให้ปรับค่าเวลาตาม State hour และ minute
      newDate.setHours(hour);
      newDate.setMinutes(minute);
    }
    setDate(newDate);
    setOpen(false); // ปิด Popover เมื่อเลือกวันเรียบร้อย
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนชั่วโมง/นาที
  const handleTimeChange = (type: 'hour' | 'minute', value: number) => {
    const newDate = date ? new Date(date) : new Date(); // ใช้ Date ปัจจุบันหรือ Date ที่เลือกไว้

    if (type === 'hour') {
      setHour(value);
      newDate.setHours(value);
    } else {
      setMinute(value);
      newDate.setMinutes(value);
    }
    setDate(newDate); // อัพเดต Date object ด้วยเวลาใหม่
  };

  // ฟังก์ชันแสดงผลสำหรับปุ่ม
  const buttonLabel = date 
    ? date.toLocaleString('th-TH', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', hour12: false // แสดงเวลา 24-ชั่วโมง
      }).replace('น.', '') // ลบ "น." ออกหากไม่ต้องการ
    : "เวลาที่รีวิว";

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button" // 🔑 สำคัญ: ป้องกันการ Submit form
            variant="default"
            id="datetime"
            // ปรับ Style ให้ปุ่มสูงขึ้นและมีเงา
            className="w-auto  h-10 text-lg justify-between font-normal bg-[#578FCA] hover:bg-[#4a7eb8] rounded-full px-6 shadow-lg space-x-12"
          >
            <span className="text-white text-base">{buttonLabel}</span>
            <FaCalendarAlt className="h-5 w-5 text-white" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            // เมื่อเลือกวัน ให้เรียก handleDateSelect เพื่อตั้งค่าเวลา
            onSelect={handleDateSelect}
          />
          
          {/* ส่วนของ Time Picker ที่เพิ่มเข้ามา */}
          <div className="flex items-center justify-center p-3 border-t">
            <span className="text-sm font-medium mr-2">เวลา:</span>
            
            {/* Select ชั่วโมง */}
            <select
              value={hour}
              onChange={(e) => handleTimeChange('hour', parseInt(e.target.value))}
              className="border rounded-md p-1 text-sm focus:ring-blue-500"
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            
            <span className="mx-1 font-bold">:</span>
            
            {/* Select นาที */}
            <select
              value={minute}
              onChange={(e) => handleTimeChange('minute', parseInt(e.target.value))}
              className="border rounded-md p-1 text-sm focus:ring-blue-500"
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}