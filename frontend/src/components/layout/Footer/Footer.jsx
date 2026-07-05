import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="w-full text-white" style={{ backgroundColor: 'var(--ho-primary-dark, #003820)', borderTop: '1px solid var(--ho-accent-gold, rgba(212, 175, 55, 0.3))' }}>
      {/* Khối 1: Danh sách các đối tác cao cấp (Phủ mờ sang trọng) */}
      <div className="py-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Container fluid="md">
          <Row className="justify-content-between align-items-center text-center fw-bold g-3" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--ho-primary-light, #95d4ac)' }}>
            <Col xs={6} sm={4} md="auto" className="text-uppercase cursor-pointer" style={{ opacity: 0.7 }}>ROLEX</Col>
            <Col xs={6} sm={4} md="auto" className="text-uppercase cursor-pointer" style={{ opacity: 0.7 }}>LONGINES</Col>
            <Col xs={6} sm={4} md="auto" className="text-uppercase cursor-pointer" style={{ opacity: 0.7 }}>DUBAI AIR</Col>
            <Col xs={6} sm={6} md="auto" className="text-uppercase cursor-pointer" style={{ opacity: 0.7 }}>NETJETS</Col>
            <Col xs={12} sm={6} md="auto" className="text-uppercase cursor-pointer" style={{ opacity: 0.7 }}>ST. JAMES</Col>
          </Row>
        </Container>
      </div>

      {/* Khối 2: Thông tin bản quyền và link điều khoản */}
      <div className="py-4">
        <Container fluid="md">
          <Row className="align-items-center justify-content-between text-center text-md-start g-3" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            {/* Tên App mới đổi ở góc trái */}
            <Col xs={12} md="auto" className="fw-bold text-white h6 mb-0">
              Horse <span style={{ color: 'var(--ho-accent-gold-hover, #fed65b)' }}>Racing</span>
            </Col>

            {/* Bản quyền */}
            <Col xs={12} md="auto" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              © {new Date().getFullYear()} Horse Racing Tournament Management. All Rights Reserved.
            </Col>

            {/* Các liên kết điều khoản */}
            <Col xs={12} md="auto">
              <div className="d-flex justify-content-center justify-content-md-end gap-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                <a href="#privacy" className="text-decoration-none text-reset" style={{ opacity: 0.8 }}>Privacy Policy</a>
                <a href="#terms" className="text-decoration-none text-reset" style={{ opacity: 0.8 }}>Terms of Service</a>
                <a href="#broadcast" className="text-decoration-none text-reset" style={{ opacity: 0.8 }}>Broadcast Guidelines</a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;