'use strict';

import React, { PropTypes, Props } from 'react';

class ProductCarousel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: null
    };
    if (typeof props.selectedProductIndex === 'number') {
      this.state.selected = props.products[props.selectedProductIndex];
    }

    this.carouselItem = this.carouselItem.bind(this);
    this.onSlideChanged = this.onSlideChanged.bind(this);
  }

  componentWillMount() {
    // Preselecting the first one, if nothing is selected
    if (!this.state.selected) {
      let firstProduct = this.props.products[0];
      if (firstProduct) {
        this.onSelectedProduct(firstProduct);
      }
    }
  }

  componentDidMount() {
    let elem = jQuery(this.refs.carouselElement);
    elem.carousel({
      autoplay: false
    })
    elem.on('afterChange', this.onSlideChanged);
  }

  componentWillUnmount() {
    let elem = jQuery(this.refs.carouselElement);
    elem.off('afterChange', this.onSlideChanged);
  }

  onSelectedProduct(product) {
    if (!product) {
      return;
    }
    this.setState({ selected: product });
    if (!this.props.onSelectedProduct) {
      return;
    }
    this.props.onSelectedProduct({
      index: this.props.products.indexOf(product),
      brand: product.brand,
      model: product.model,
      price: product.price
    });
  }

  onSlideChanged(event) {
    if (event.type == 'afterChange') {
      let activeSlide = jQuery(this.refs.carouselElement).find('.slick-current.slick-active');
      let index = Number(activeSlide.attr('data-slick-index'));
      this.onSelectedProduct(this.props.products[index]);
    }
  }

  carouselItem(product, index) {
    let isActive = this.selected === product;
    return (
      <div key={index} className={`${isActive ? ' is-active' : ''}`}>
        <p><img src={product.imgSrc} /></p>
        <p dangerouslySetInnerHTML={{ __html: product.description }}></p>
      </div>
    );
  }

  render() {
    return (
      <div ref='carouselElement'>
        {this.props.products.map(this.carouselItem)}
      </div>
    );
  }
};

ProductCarousel.propTypes = {
  products: PropTypes.array.isRequired,
  selectedProductIndex: PropTypes.number,
  onSelectedProduct: PropTypes.func
}

export default ProductCarousel;
