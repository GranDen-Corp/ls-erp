"use client"

import { DataTable } from "./data-table"
import { Badge } from "@/components/ui/badge"

// 認證狀態徽章渲染函數
const renderCertificationStatus = (status: string, expiry: string) => {
  // 檢查認證是否有效
  const isValid = status === "是" || status === "符合" || status === "已提供"

  // 檢查是否過期
  const isExpired = expiry && new Date(expiry) < new Date()

  // 決定顯示狀態
  let displayStatus = "未知"
  let badgeClass = "bg-gray-50 text-gray-700 border-gray-200"

  if (isValid) {
    if (isExpired) {
      displayStatus = "已過期"
      badgeClass = "bg-red-50 text-red-700 border-red-200"
    } else {
      displayStatus = "有效"
      badgeClass = "bg-green-50 text-green-700 border-green-200"
    }
  } else if (status === "否" || status === "不符合" || status === "未提供") {
    displayStatus = "無"
    badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200"
  } else if (status === "審核中") {
    displayStatus = "審核中"
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200"
  }

  return (
    <Badge variant="outline" className={badgeClass}>
      {displayStatus}
    </Badge>
  )
}

export function SupplierDataTable() {
  // 定義供應商資料表的欄位
  const columns = [
    {
      key: "factory_id",
      title: "供應商編號",
      sortable: true,
    },
    {
      key: "factory_name",
      title: "供應商名稱",
      sortable: true,
    },
    {
      key: "supplier_type",
      title: "類型",
      render: (value: string) => (
        <Badge
          variant="outline"
          className={
            value === "製造商"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : value === "加工商"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-green-50 text-green-700 border-green-200"
          }
        >
          {value}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "category1",
      title: "主要分類",
      sortable: true,
    },
    {
      key: "iso9001_certified",
      title: "ISO 9001",
      render: (value: string, item: any) => renderCertificationStatus(value, item.iso9001_expiry),
      sortable: true,
    },
    {
      key: "iatf16949_certified",
      title: "IATF 16949",
      render: (value: string, item: any) => renderCertificationStatus(value, item.iatf16949_expiry),
      sortable: true,
    },
  ]

  // 定義供應商詳情頁籤
  const detailTabs = [
    {
      id: "details",
      label: "基本資訊",
      fields: [
        { label: "供應商編號", key: "factory_id" },
        { label: "供應商簡稱", key: "factory_name" },
        { label: "供應商全名", key: "factory_full_name" },
        { label: "供應商類型", key: "supplier_type" },
        { label: "統一編號", key: "tax_id" },
        { label: "地址", key: "factory_address" },
        { label: "發票地址", key: "invoice_address" },
        { label: "電話", key: "factory_phone" },
        { label: "傳真", key: "factory_fax" },
        { label: "品管聯絡人", key: "quality_contact1" },
        { label: "備用品管聯絡人", key: "quality_contact2" },
        { label: "主要分類", key: "category1" },
        { label: "次要分類", key: "category2" },
        { label: "第三分類", key: "category3" },
        { label: "三年內直接/間接往來", key: "direct_relation_3yrs" },
      ],
    },
    {
      id: "certifications",
      label: "認證資訊",
      fields: [
        {
          label: "ISO 9001",
          key: "iso9001_certified",
          render: (value: string) => (
            <div className="space-y-1">
              <div>認證狀態: {value || "未提供"}</div>
            </div>
          ),
        },
        { label: "ISO 9001 有效期至", key: "iso9001_expiry" },
        {
          label: "IATF 16949",
          key: "iatf16949_certified",
          render: (value: string) => (
            <div className="space-y-1">
              <div>認證狀態: {value || "未提供"}</div>
            </div>
          ),
        },
        { label: "IATF 16949 有效期至", key: "iatf16949_expiry" },
        {
          label: "ISO 17025",
          key: "iso17025_certified",
          render: (value: string) => (
            <div className="space-y-1">
              <div>認證狀態: {value || "未提供"}</div>
            </div>
          ),
        },
        { label: "ISO 17025 有效期至", key: "iso17025_expiry" },
        {
          label: "CQI-9 (熱處理)",
          key: "cqi9_certified",
          render: (value: string) => (
            <div className="space-y-1">
              <div>認證狀態: {value || "未提供"}</div>
            </div>
          ),
        },
        { label: "CQI-9 有效期至", key: "cqi9_expiry" },
        {
          label: "CQI-11 (電鍍)",
          key: "cqi11_certified",
          render: (value: string) => (
            <div className="space-y-1">
              <div>認證狀態: {value || "未提供"}</div>
            </div>
          ),
        },
        { label: "CQI-11 有效期至", key: "cqi11_expiry" },
        {
          label: "CQI-12 (塗裝)",
          key: "cqi12_certified",
          render: (value: string) => (
            <div className="space-y-1">
              <div>認證狀態: {value || "未提供"}</div>
            </div>
          ),
        },
        { label: "CQI-12 有效期至", key: "cqi12_expiry" },
      ],
    },
    {
      id: "compliance",
      label: "合規狀況",
      fields: [
        { label: "RoHS 合規狀態", key: "rohs_compliance" },
        { label: "REACH 合規狀態", key: "reach_compliance" },
        { label: "PFAS 合規狀態", key: "pfas_compliance" },
        { label: "CMRT 提供狀態", key: "cmrt_provided" },
        { label: "TSCA 合規狀態", key: "tsca_compliance" },
        { label: "EMRT 提供狀態", key: "emrt_provided" },
        { label: "CP65 合規狀態", key: "cp65_compliance" },
        { label: "EU POP 合規狀態", key: "eu_pop_compliance" },
      ],
    },
    {
      id: "notes",
      label: "備註資訊",
      fields: [
        { label: "採購單備註提醒", key: "po_reminder_note" },
        { label: "合格供應商清單備註", key: "approval_note" },
        { label: "停用原因", key: "disabled_reason" },
        { label: "舊訂單系統備註", key: "legacy_notes" },
      ],
    },
  ]

  // 定義篩選選項
  const filterOptions = [
    {
      field: "supplier_type",
      label: "供應商類型",
      options: [
        { value: "製造商", label: "製造商" },
        { value: "加工商", label: "加工商" },
        { value: "貿易商", label: "貿易商" },
      ],
    },
    {
      field: "category1",
      label: "主要分類",
      options: [
        { value: "汽車螺絲", label: "汽車螺絲" },
        { value: "特殊螺絲", label: "特殊螺絲" },
        { value: "焊點螺栓", label: "焊點螺栓" },
        { value: "車床件", label: "車床件" },
        { value: "沖壓件", label: "沖壓件" },
        { value: "組裝件", label: "組裝件" },
      ],
    },
  ]

  return (
    <DataTable
      title="供應商資料表"
      tableName="suppliers"
      columns={columns}
      detailTabs={detailTabs}
      filterOptions={filterOptions}
    />
  )
}
