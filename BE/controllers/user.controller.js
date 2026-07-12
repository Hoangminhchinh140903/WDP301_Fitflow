/**
 * USER CONTROLLER - Xử lý logic nghiệp vụ cho User
 * 
 * Controller chứa LOGIC, routes chỉ ĐỊNH TUYẾN
 * Template này dùng để copy cho các model khác
 */

const bcrypt = require('bcryptjs');
const User = require('../model/User.model');
const RentOrder = require('../model/RentOrder.model');
const SaleOrder = require('../model/SaleOrder.model');
const ProfileAuditLog = require('../model/ProfileAuditLog.model');
const { hasCloudinaryConfig, uploadImageBuffer } = require('../utils/cloudinary');
const { isValidEmail, isValidPhone, normalizeEmail, normalizePhone } = require('../utils/guestVerification');

const sanitizeUser = (user) => ({
  id: user._id,
  role: user.role,
  name: user.name,
  phone: user.phone,
  email: user.email,
  status: user.status,
  avatarUrl: user.avatarUrl,
  address: user.address,
  gender: user.gender,
  dateOfBirth: user.dateOfBirth,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const sanitizeCustomer = (user) => ({
  id: user._id,
  role: user.role,
  name: user.name,
  phone: user.phone,
  email: user.email,
  status: user.status,
  avatarUrl: user.avatarUrl,
  address: user.address,
  gender: user.gender,
  dateOfBirth: user.dateOfBirth,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Get profile successfully',
      data: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error getting profile',
      error: error.message
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'email', 'avatarUrl', 'address', 'gender', 'dateOfBirth'];
    const payload = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        payload[field] = req.body[field];
      }
    });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid profile fields to update'
      });
    }

    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (payload.email) {
      const normalizedEmail = normalizeEmail(payload.email);

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Email không hợp lệ'
        });
      }

      payload.email = normalizedEmail;

      const emailConflict = await User.findOne({
        _id: { $ne: req.user.id },
        email: normalizedEmail
      });

      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }
    }

    if (payload.phone !== undefined) {
      const normalizedPhone = normalizePhone(payload.phone);

      if (!normalizedPhone) {
        payload.phone = null;
      } else {
        if (!isValidPhone(normalizedPhone)) {
          return res.status(400).json({
            success: false,
            message: 'Số điện thoại không hợp lệ'
          });
        }

        const phoneConflict = await User.findOne({
          _id: { $ne: req.user.id },
          phone: normalizedPhone
        });

        if (phoneConflict) {
          return res.status(409).json({
            success: false,
            message: 'Số điện thoại đã được sử dụng'
          });
        }

        payload.phone = normalizedPhone;
      }
    }

    if (payload.name) {
      payload.name = String(payload.name).trim();
      if (!payload.name) {
        return res.status(400).json({
          success: false,
          message: 'Tên không được để trống'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, payload, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      message: 'Update profile successfully',
      data: sanitizeUser(updatedUser)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Delete profile successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'newPassword must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Change password successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

const uploadMyAvatar = async (req, res) => {
  try {
    if (!hasCloudinaryConfig()) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Avatar file is required'
      });
    }

    const result = await uploadImageBuffer(req.file.buffer, {
      folder: 'fitflow/avatars',
      public_id: `user_${req.user.id}_${Date.now()}`,
      resource_type: 'image'
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl: result.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Upload avatar successfully',
      data: sanitizeUser(updatedUser)
    });
  } catch (error) {
    const uploadErrorMessage = error?.error?.message || error?.message || 'Upload failed';

    return res.status(500).json({
      success: false,
      message: uploadErrorMessage,
      error: uploadErrorMessage
    });
  }
};

const listCustomers = async (req, res) => {
  try {
    const filter = { role: 'customer' };
    const { status } = req.query;

    if (status === 'active' || status === 'locked') {
      filter.status = status;
    }

    const customers = await User.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Get customer list successfully',
      data: customers.map(sanitizeCustomer)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error getting customer list',
      error: error.message
    });
  }
};

const getCustomerDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await User.findById(id);

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const [rentOrders, saleOrders] = await Promise.all([
      RentOrder.find({ customerId: customer._id }).sort({ createdAt: -1 }),
      SaleOrder.find({ customerId: customer._id }).sort({ createdAt: -1 })
    ]);

    // ─── Tính tổng chi tiêu chính xác ───
    // Đơn mua: chỉ đếm nếu đã xác nhận thanh toán (không đếm Pending/Cancelled/Failed)
    const SALE_PAID_STATUSES = ['PendingConfirmation', 'Confirmed', 'Shipping', 'Completed', 'Returned', 'Refunded'];
    // Đơn thuê: chỉ đếm khi đã đặt cọc thành công trở đi
    const RENT_PAID_STATUSES = ['Deposited', 'Confirmed', 'WaitingPickup', 'Renting', 'WaitingReturn', 'Returned', 'Completed', 'Compensation'];

    const saleSpent = saleOrders
      .filter((o) => SALE_PAID_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const rentSpent = rentOrders
      .filter((o) => RENT_PAID_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const totalSpent = saleSpent + rentSpent;

    const summary = {
      totalOrders: rentOrders.length + saleOrders.length,
      totalRentOrders: rentOrders.length,
      totalSaleOrders: saleOrders.length,
      totalSpent,
      saleSpent,
      rentSpent,
    };

    return res.status(200).json({
      success: true,
      message: 'Get customer detail successfully',
      data: {
        customer: sanitizeCustomer(customer),
        rentOrders,
        saleOrders,
        summary,
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error getting customer detail',
      error: error.message
    });
  }
};

const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'active' && status !== 'locked') {
      return res.status(400).json({
        success: false,
        message: 'status must be active or locked'
      });
    }

    const customer = await User.findOne({ _id: id, role: 'customer' });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.status = status;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Update customer status successfully',
      data: sanitizeCustomer(customer)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating customer status',
      error: error.message
    });
  }
};

// --- AUDIT LOG & PROFILE HELPERS ---

const createAuditLog = async (userId, action, req, options = {}) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    await ProfileAuditLog.create({
      userId,
      action,
      ipAddress,
      userAgent,
      changedFields: options.changedFields || [],
      oldValues: options.oldValues || {},
      newValues: options.newValues || {},
      status: options.status || 'success',
      errorMessage: options.errorMessage || null
    });
  } catch (error) {
    console.error('Failed to create profile audit log:', error.message);
  }
};

const calculateCompleteness = (user) => {
  let score = 0;
  const weights = {
    name: 15,
    email: 15,
    phone: 15,
    avatarUrl: 15,
    address: 15,
    gender: 10,
    dateOfBirth: 15
  };
  
  if (user.name) score += weights.name;
  if (user.email) score += weights.email;
  if (user.phone) score += weights.phone;
  if (user.avatarUrl) score += weights.avatarUrl;
  if (user.address) score += weights.address;
  if (user.gender) score += weights.gender;
  if (user.dateOfBirth) score += weights.dateOfBirth;
  
  return score;
};

// --- DATA EXPORT SERVICES (GDPR COMPLIANCE) ---

const exportMyProfileDataJSON = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const [rentOrders, saleOrders, auditLogs] = await Promise.all([
      RentOrder.find({ customerId: user._id }).sort({ createdAt: -1 }),
      SaleOrder.find({ customerId: user._id }).sort({ createdAt: -1 }),
      ProfileAuditLog.find({ userId: user._id }).sort({ createdAt: -1 })
    ]);
    
    const exportData = {
      exportedAt: new Date(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      },
      preferences: user.preferences || {},
      activityLogs: auditLogs.map(log => ({
        action: log.action,
        timestamp: log.createdAt,
        status: log.status
      })),
      orders: {
        rental: rentOrders.map(o => ({
          orderId: o._id,
          status: o.status,
          totalAmount: o.totalAmount,
          createdAt: o.createdAt
        })),
        sale: saleOrders.map(o => ({
          orderId: o._id,
          status: o.status,
          totalAmount: o.totalAmount,
          createdAt: o.createdAt
        }))
      }
    };
    
    await createAuditLog(req.user.id, 'EXPORT_DATA', req, {
      newValues: { format: 'JSON' }
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=fitflow_profile_${req.user.id}.json`);
    return res.status(200).send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error exporting profile data', error: error.message });
  }
};

const exportMyProfileDataCSV = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const [rentOrders, saleOrders] = await Promise.all([
      RentOrder.find({ customerId: user._id }).sort({ createdAt: -1 }),
      SaleOrder.find({ customerId: user._id }).sort({ createdAt: -1 })
    ]);
    
    let csvContent = '\uFEFF'; // Add UTF-8 BOM for Excel support
    
    // User Profile Section
    csvContent += '--- THÔNG TIN CÁ NHÂN ---\n';
    csvContent += 'Trường,Giá trị\n';
    csvContent += `Mã người dùng,"${user._id}"\n`;
    csvContent += `Họ và tên,"${user.name || ''}"\n`;
    csvContent += `Email,"${user.email || ''}"\n`;
    csvContent += `Số điện thoại,"${user.phone || ''}"\n`;
    csvContent += `Địa chỉ,"${user.address || ''}"\n`;
    csvContent += `Giới tính,"${user.gender || ''}"\n`;
    csvContent += `Ngày sinh,"${user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : ''}"\n`;
    csvContent += `Vai trò,"${user.role}"\n`;
    csvContent += `Trạng thái,"${user.status}"\n`;
    csvContent += `Ngày tạo,"${user.createdAt.toISOString()}"\n\n`;
    
    // Rental Orders Section
    csvContent += '--- ĐƠN THUÊ TRANG PHỤC ---\n';
    csvContent += 'Mã đơn thuê,Trạng thái,Tổng tiền,Ngày đặt\n';
    rentOrders.forEach(o => {
      csvContent += `"${o._id}","${o.status}",${o.totalAmount || 0},"${o.createdAt.toISOString()}"\n`;
    });
    csvContent += '\n';
    
    // Sale Orders Section
    csvContent += '--- ĐƠN MUA HÀNG ---\n';
    csvContent += 'Mã đơn mua,Trạng thái,Tổng tiền,Ngày mua\n';
    saleOrders.forEach(o => {
      csvContent += `"${o._id}","${o.status}",${o.totalAmount || 0},"${o.createdAt.toISOString()}"\n`;
    });
    
    await createAuditLog(req.user.id, 'EXPORT_DATA', req, {
      newValues: { format: 'CSV' }
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=fitflow_profile_${req.user.id}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error exporting profile data', error: error.message });
  }
};

const exportMyProfileDataXML = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const [rentOrders, saleOrders] = await Promise.all([
      RentOrder.find({ customerId: user._id }).sort({ createdAt: -1 }),
      SaleOrder.find({ customerId: user._id }).sort({ createdAt: -1 })
    ]);
    
    const escapeXml = (unsafe) => {
      if (!unsafe) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<ProfileExport>\n';
    xmlContent += '  <ExportedAt>' + new Date().toISOString() + '</ExportedAt>\n';
    xmlContent += '  <User>\n';
    xmlContent += '    <Id>' + user._id + '</Id>\n';
    xmlContent += '    <Name>' + escapeXml(user.name) + '</Name>\n';
    xmlContent += '    <Email>' + escapeXml(user.email) + '</Email>\n';
    xmlContent += '    <Phone>' + escapeXml(user.phone) + '</Phone>\n';
    xmlContent += '    <Address>' + escapeXml(user.address) + '</Address>\n';
    xmlContent += '    <Gender>' + escapeXml(user.gender) + '</Gender>\n';
    xmlContent += '    <DateOfBirth>' + (user.dateOfBirth ? user.dateOfBirth.toISOString() : '') + '</DateOfBirth>\n';
    xmlContent += '    <Role>' + user.role + '</Role>\n';
    xmlContent += '    <Status>' + user.status + '</Status>\n';
    xmlContent += '  </User>\n';
    
    xmlContent += '  <RentalOrders>\n';
    rentOrders.forEach(o => {
      xmlContent += '    <Order>\n';
      xmlContent += '      <OrderId>' + o._id + '</OrderId>\n';
      xmlContent += '      <Status>' + o.status + '</Status>\n';
      xmlContent += '      <TotalAmount>' + (o.totalAmount || 0) + '</TotalAmount>\n';
      xmlContent += '      <CreatedAt>' + o.createdAt.toISOString() + '</CreatedAt>\n';
      xmlContent += '    </Order>\n';
    });
    xmlContent += '  </RentalOrders>\n';
    
    xmlContent += '  <SaleOrders>\n';
    saleOrders.forEach(o => {
      xmlContent += '    <Order>\n';
      xmlContent += '      <OrderId>' + o._id + '</OrderId>\n';
      xmlContent += '      <Status>' + o.status + '</Status>\n';
      xmlContent += '      <TotalAmount>' + (o.totalAmount || 0) + '</TotalAmount>\n';
      xmlContent += '      <CreatedAt>' + o.createdAt.toISOString() + '</CreatedAt>\n';
      xmlContent += '    </Order>\n';
    });
    xmlContent += '  </SaleOrders>\n';
    xmlContent += '</ProfileExport>\n';
    
    await createAuditLog(req.user.id, 'EXPORT_DATA', req, {
      newValues: { format: 'XML' }
    });
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=fitflow_profile_${req.user.id}.xml`);
    return res.status(200).send(xmlContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error exporting profile data', error: error.message });
  }
};

const exportMyProfileDataHTML = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const [rentOrders, saleOrders] = await Promise.all([
      RentOrder.find({ customerId: user._id }).sort({ createdAt: -1 }),
      SaleOrder.find({ customerId: user._id }).sort({ createdAt: -1 })
    ]);
    
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Báo cáo hồ sơ người dùng - FitFlow</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    h2 { color: #2980b9; margin-top: 30px; }
    .card { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #dee2e6; padding: 12px; text-align: left; }
    th { background-color: #f1f3f5; font-weight: bold; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.9em; font-weight: bold; }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-info { background: #d1ecf1; color: #0c5460; }
  </style>
</head>
<body>
  <h1>Báo cáo dữ liệu hồ sơ FitFlow</h1>
  <p>Ngày xuất dữ liệu: ${new Date().toLocaleString('vi-VN')}</p>
  
  <div class="card">
    <h2>Thông tin cá nhân</h2>
    <table>
      <tr><th>Mã người dùng</th><td>\${user._id}</td></tr>
      <tr><th>Họ và tên</th><td>\${user.name}</td></tr>
      <tr><th>Email</th><td>\${user.email}</td></tr>
      <tr><th>Số điện thoại</th><td>\${user.phone || 'Chưa cung cấp'}</td></tr>
      <tr><th>Địa chỉ</th><td>\${user.address || 'Chưa cung cấp'}</td></tr>
      <tr><th>Giới tính</th><td>\${user.gender || 'Chưa cung cấp'}</td></tr>
      <tr><th>Ngày sinh</th><td>\${user.dateOfBirth ? user.dateOfBirth.toLocaleDateString('vi-VN') : 'Chưa cung cấp'}</td></tr>
      <tr><th>Vai trò</th><td><span class="badge badge-info">\${user.role}</span></td></tr>
      <tr><th>Trạng thái</th><td><span class="badge badge-success">\${user.status}</span></td></tr>
    </table>
  </div>
  
  <h2>Đơn thuê trang phục</h2>
  <table>
    <thead>
      <tr>
        <th>Mã đơn</th>
        <th>Trạng thái</th>
        <th>Tổng tiền</th>
        <th>Ngày đặt</th>
      </tr>
    </thead>
    <tbody>
      \${rentOrders.map(o => \`
        <tr>
          <td>\${o._id}</td>
          <td>\${o.status}</td>
          <td>\${(o.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
          <td>\${o.createdAt.toLocaleString('vi-VN')}</td>
        </tr>
      \`).join('')}
      \${rentOrders.length === 0 ? '<tr><td colspan="4">Không có dữ liệu đơn thuê.</td></tr>' : ''}
    </tbody>
  </table>
  
  <h2>Đơn mua hàng</h2>
  <table>
    <thead>
      <tr>
        <th>Mã đơn</th>
        <th>Trạng thái</th>
        <th>Tổng tiền</th>
        <th>Ngày mua</th>
      </tr>
    </thead>
    <tbody>
      \${saleOrders.map(o => \`
        <tr>
          <td>\${o._id}</td>
          <td>\${o.status}</td>
          <td>\${(o.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
          <td>\${o.createdAt.toLocaleString('vi-VN')}</td>
        </tr>
      \`).join('')}
      \${saleOrders.length === 0 ? '<tr><td colspan="4">Không có dữ liệu đơn hàng.</td></tr>' : ''}
    </tbody>
  </table>
</body>
</html>
    `;
    
    await createAuditLog(req.user.id, 'EXPORT_DATA', req, {
      newValues: { format: 'HTML' }
    });
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=fitflow_profile_${req.user.id}.html`);
    return res.status(200).send(htmlContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error exporting profile data', error: error.message });
  }
};

// --- PREFERENCE MANAGEMENT & COMPLETENESS ---

const getMyPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: user.preferences || {
        theme: 'light',
        language: 'vi',
        notifications: { email: true, sms: false, push: true, marketing: false }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching preferences', error: error.message });
  }
};

const updateMyPreferences = async (req, res) => {
  try {
    const { theme, language, notifications } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const oldValues = { preferences: user.preferences };
    
    if (theme) user.preferences.theme = theme;
    if (language) user.preferences.language = language;
    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }
    
    await user.save();
    
    await createAuditLog(req.user.id, 'UPDATE_PREFERENCES', req, {
      oldValues,
      newValues: { preferences: user.preferences }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating preferences', error: error.message });
  }
};

const getProfileCompleteness = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const score = calculateCompleteness(user);
    user.profileCompleteness = score;
    await user.save();
    
    const missingFields = [];
    if (!user.phone) missingFields.push('Số điện thoại');
    if (!user.avatarUrl) missingFields.push('Ảnh đại diện');
    if (!user.address) missingFields.push('Địa chỉ giao hàng');
    if (!user.gender) missingFields.push('Giới tính');
    if (!user.dateOfBirth) missingFields.push('Ngày sinh');
    
    return res.status(200).json({
      success: true,
      data: {
        score,
        missingFields,
        isComplete: score === 100
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error calculating profile completeness', error: error.message });
  }
};

const getMyProfileActivityLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    
    const logs = await ProfileAuditLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    const total = await ProfileAuditLog.countDocuments({ userId: req.user.id });
    
    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching profile activity logs', error: error.message });
  }
};

// Export function
module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  changePassword,
  uploadMyAvatar,
  listCustomers,
  getCustomerDetail,
  updateCustomerStatus,
  
  // New profile features
  exportMyProfileDataJSON,
  exportMyProfileDataCSV,
  exportMyProfileDataXML,
  exportMyProfileDataHTML,
  getMyPreferences,
  updateMyPreferences,
  getProfileCompleteness,
  getMyProfileActivityLogs
};
