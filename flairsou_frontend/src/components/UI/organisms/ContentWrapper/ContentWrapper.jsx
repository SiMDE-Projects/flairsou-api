import React from 'react'
import propTypes from 'prop-types'
import Header from '../../molecules/Header/Header'
import Navbar from '../../molecules/Navbar/Navbar'
import './ContentWrapper.css'

const ContentWrapper = ({content}) => (
    <div className='content-wrapper-v'>
        <Header />
        <div className='content-wrapper-h'>
            <Navbar />
            {content}
        </div>
    </div>
)

export default ContentWrapper